// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {EIP712Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import {MulticallUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/MulticallUpgradeable.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import {DeliveryStorage} from "./storage/DeliveryStorage.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IRevenueManager} from "./interface/IRevenueManager.sol";
import {IDelivery} from "./interface/IDelivery.sol";



contract DeliveryImpl is UUPSUpgradeable, AccessControlUpgradeable, PausableUpgradeable, EIP712Upgradeable, MulticallUpgradeable, IDelivery {

    // keccak256("GOVERNOR_ROLE")
    bytes32 public constant GOVERNOR_ROLE = 0x7935bd0ae54bc31f548c14dba4d37c5c64b3f8ca900cb468fb8abd54d5894f55;
    // keccak256("MANAGER_ROLE")
    bytes32 public constant MANAGER_ROLE = 0x241ecf16d79d0f8dbfb92cbc07fe17840425976cf0667f022fe9877caa831b08;
    bytes32 public constant REQUEST_ORDER_TYPEHASH =
        keccak256("REQUEST_ORDER_TYPEHASH(address client,uint256 orderId, uint256 expiration)");
    bytes32 public constant COMPLETE_ORDER_TYPEHASH =
        keccak256("COMPLETE_ORDER_TYPEHASH(address client,address deliverer,uint256 orderId)");
    
    constructor() {
        _disableInitializers();
    }

    function initialize(address _initialOwner, address _governor, address _manager, address _treasuryController, address _currencyToken, uint256 _feeRate, uint256 _minOrderPrice) external initializer {
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, _initialOwner);
        _grantRole(GOVERNOR_ROLE, _governor);
        _grantRole(MANAGER_ROLE, _manager); // 서명 권한
        _setRoleAdmin(MANAGER_ROLE, DEFAULT_ADMIN_ROLE);
        __Pausable_init();
        __EIP712_init("Delivery", "1");
        __Multicall_init();

        IERC20(_currencyToken).approve(_treasuryController, type(uint256).max);

        DeliveryStorage.Data storage data_ = _deliveryStorage();
        data_.treasuryController = _treasuryController;
        data_.currencyToken = _currencyToken;
        data_.feeRate = _feeRate;
        data_.minOrderPrice = _minOrderPrice;
    }

    /*//////////////////////////////////////////////////////////////
                            EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev 주문 요청, manager의 서명 필요
     * @param _orderId 주문 ID
     * @param _orderPrice 주문 가격
     * @param _manager 관리자 주소
     * @param _managerSignature 관리자 서명
     * @param _signatureExpiration 서명 만료 시간
     */
    function requestOrder(uint256 _orderId, uint256 _orderPrice, address _manager, bytes calldata _managerSignature, uint256 _signatureExpiration) external virtual whenNotPaused {
        // manager 권한 확인
        if (!hasRole(MANAGER_ROLE, _manager)) revert Unauthorized();
        // 서명 만료 시간 확인
        if (block.timestamp > _signatureExpiration) revert ExpiredSignature();

        DeliveryStorage.Data storage data_ = _deliveryStorage();
        // 주문 가격 확인
        if (_orderPrice < data_.minOrderPrice) revert InvalidOrderPrice();
        // 주문 상태 확인
        if (data_.orders[_orderId].status != DeliveryStorage.OrderStatus.NotRequested) revert AlreadyRequested();

        address _client = msg.sender;

        bytes32 structHash = keccak256(
            abi.encode(
                REQUEST_ORDER_TYPEHASH,
                _client,
                _orderId,
                _signatureExpiration
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        // manager 서명 검증, Contract Account의 서명 검증 지원
        if (!SignatureChecker.isValidSignatureNow(_manager, digest, _managerSignature)) revert InvalidSignature();

        data_.orders[_orderId].client = _client;
        data_.orders[_orderId].price = _orderPrice;
        data_.orders[_orderId].status = DeliveryStorage.OrderStatus.Pending;
        data_.orders[_orderId].requestTime = block.timestamp;
        
        // 주문자에게 주문 가격 차감
        if (!IERC20(data_.currencyToken).transferFrom(_client, address(this), _orderPrice)) revert ExternalCallFailed();

        emit OrderRequested(_orderId, _client, _orderPrice);
    }

    /**
     * @dev 주문 수락, 배송자 등록
     * @param _orderId 주문 ID
     */
    function acceptOrder(uint256 _orderId) external virtual whenNotPaused {
        DeliveryStorage.Data storage data_ = _deliveryStorage();

        address _deliverer = msg.sender;
        // 배송자 등록 여부 확인
        if (!data_.registeredDeliverers[_deliverer]) revert NotRegisteredDeliverer();
        // 주문 상태 확인
        if (data_.orders[_orderId].status != DeliveryStorage.OrderStatus.Pending) revert NotPending();
        // 주문자와 배송자가 같은 경우 예외 처리
        if (data_.orders[_orderId].client == _deliverer) revert SelfAccept();

        data_.orders[_orderId].deliverer = _deliverer;
        data_.orders[_orderId].status = DeliveryStorage.OrderStatus.Accepted;
        data_.orders[_orderId].acceptTime = block.timestamp;

        emit OrderAccepted(_orderId, _deliverer);
    }

    /**
     * @dev 주문 완료, 수익금 정산, 호출은 누구나 가능
     * @param _orderId 주문 ID
     * @param _clientSignature 주문자 서명
     * @param _delivererSignature 배송자 서명
     */
    function completeOrder(uint256 _orderId, bytes calldata _clientSignature, bytes calldata _delivererSignature) external virtual whenNotPaused {
        DeliveryStorage.Data storage data_ = _deliveryStorage();
        // 주문 상태 확인
        if (data_.orders[_orderId].status != DeliveryStorage.OrderStatus.Accepted) revert NotAccepted();

        uint256 _now = block.timestamp;

        address _client = data_.orders[_orderId].client;
        address _deliverer = data_.orders[_orderId].deliverer;
        uint256 _orderPrice = data_.orders[_orderId].price;
        address _currencyToken = data_.currencyToken;

        bytes32 structHash = keccak256(
            abi.encode(
                COMPLETE_ORDER_TYPEHASH,
                _client,
                _deliverer,
                _orderId
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);

        // client 서명 검증, Contract Account의 서명 검증 지원
        if (!SignatureChecker.isValidSignatureNow(_client, digest, _clientSignature)) revert InvalidSignature();

        // deliverer 서명 검증, Contract Account의 서명 검증 지원
        if (!SignatureChecker.isValidSignatureNow(_deliverer, digest, _delivererSignature)) revert InvalidSignature();

        data_.orders[_orderId].status = DeliveryStorage.OrderStatus.Completed;
        data_.orders[_orderId].completeTime = _now;

        // 플랫폼 이용 수수료 계산
        uint256 _fee = (_orderPrice * data_.feeRate) / 10000;
        // 수수료 제출
        if (!IRevenueManager(data_.treasuryController).submitRevenue(_currencyToken, _fee, _deliverer)) revert ExternalCallFailed();

        // 배송자에게 의뢰금 전달
        if (!IERC20(_currencyToken).transfer(_deliverer, _orderPrice - _fee)) revert ExternalCallFailed();

        emit OrderCompleted(_orderId, _now);
    }

    /**
     * @dev 주문 취소
     * @param _orderId 주문 ID
     */
    function cancelOrder(uint256 _orderId) external virtual whenNotPaused {
        DeliveryStorage.Data storage data_ = _deliveryStorage();
        
        DeliveryStorage.OrderStatus _status = data_.orders[_orderId].status;
        address _client = data_.orders[_orderId].client;
        address _currencyToken = data_.currencyToken;
        address _sender = msg.sender;

        if (_status == DeliveryStorage.OrderStatus.NotRequested) revert NotRequested();
        // 주문자 또는 관리자만 취소 가능
        if (_client != _sender && !hasRole(MANAGER_ROLE, _sender)) revert Unauthorized();
        if (_client == _sender) {
            // 주문자가 취소 시 주문 상태가 Pending 인 경우만 취소 가능
            if (_status != DeliveryStorage.OrderStatus.Pending) revert NotPending();
        }

        data_.orders[_orderId].status = DeliveryStorage.OrderStatus.Cancelled;
        data_.orders[_orderId].cancelTime = block.timestamp;

        // 주문자에게 주문 가격 반환
        bool transferSuccess = IERC20(_currencyToken).transfer(_client, data_.orders[_orderId].price);
        if (!transferSuccess) revert ExternalCallFailed();

        emit OrderCancelled(_orderId, _client);
    }

    function setTreasuryController(address _treasuryController) external virtual onlyRole(DEFAULT_ADMIN_ROLE) {
        DeliveryStorage.Data storage data_ = _deliveryStorage();
        data_.treasuryController = _treasuryController;
    }

    function setCurrencyToken(address _currencyToken) external virtual onlyRole(DEFAULT_ADMIN_ROLE) {
        DeliveryStorage.Data storage data_ = _deliveryStorage();
        IERC20(_currencyToken).approve(data_.treasuryController, type(uint256).max);
        data_.currencyToken = _currencyToken;
    }

    function setFeeRate(uint256 _feeRate) external virtual onlyRole(GOVERNOR_ROLE) {
        DeliveryStorage.Data storage data_ = _deliveryStorage();
        data_.feeRate = _feeRate;
    }

    function setMinOrderPrice(uint256 _minOrderPrice) external virtual onlyRole(GOVERNOR_ROLE) {
        DeliveryStorage.Data storage data_ = _deliveryStorage();
        data_.minOrderPrice = _minOrderPrice;
    }

    function setRegisteredDeliverer(address _deliverer, bool _registered) external virtual onlyRole(MANAGER_ROLE) {
        DeliveryStorage.Data storage data_ = _deliveryStorage();
        data_.registeredDeliverers[_deliverer] = _registered;
    }

    function getTreasuryController() external view virtual returns (address) {
        DeliveryStorage.Data storage data_ = _deliveryStorage();
        return data_.treasuryController;
    }

    function getCurrencyToken() external view virtual returns (address) {
        DeliveryStorage.Data storage data_ = _deliveryStorage();    
        return data_.currencyToken;
    }

    function getFeeRate() external view virtual returns (uint256) {
        DeliveryStorage.Data storage data_ = _deliveryStorage();
        return data_.feeRate;
    }

    function getMinOrderPrice() external view virtual returns (uint256) {
        DeliveryStorage.Data storage data_ = _deliveryStorage();
        return data_.minOrderPrice;
    }

    function getRegisteredDeliverers(address _deliverer) external view virtual returns (bool) {    
        DeliveryStorage.Data storage data_ = _deliveryStorage();
        return data_.registeredDeliverers[_deliverer];
    }        

    /*//////////////////////////////////////////////////////////////
                            INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    function _deliveryStorage() internal pure returns (DeliveryStorage.Data storage data_) {
        data_ = DeliveryStorage.data();
    }
}
