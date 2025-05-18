import { Config } from 'src/config/environment/config';

const environment = Config.getEnvironment().SERVER_ENVIRONMENT_ID.toUpperCase();

export const QUEUE = {
  REQUEST_ORDER_QUEUE: `${environment}_REQUEST_ORDER_QUEUE`,
  ACCEPT_ORDER_QUEUE: `${environment}_ACCEPT_ORDER_QUEUE`,
  CANCEL_ORDER_QUEUE: `${environment}_CANCEL_ORDER_QUEUE`,
  COMPLETE_ORDER_QUEUE: `${environment}_COMPLETE_ORDER_QUEUE`,
  COMPLETE_ORDER_NOTI_QUEUE: `${environment}_COMPLETE_ORDER_NOTI_QUEUE`,
  COMPLETE_ORDER_LOG_QUEUE: `${environment}_COMPLETE_ORDER_LOG_QUEUE`,
};
