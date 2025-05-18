import 'reflect-metadata';

const properties = Symbol('properties');

export const MqProperty = (options: {
  type: string;
  description: string;
  required: boolean;
}) => {
  return (target: any, propertyName: string) => {
    const propertiesArray = target[properties] || (target[properties] = []);
    propertiesArray.push({
      name: propertyName,
      ...options,
    });
  };
};

export function getProperties(target: any): Array<{
  name: string;
  type: string;
  description: string;
  required: boolean;
}> {
  return target.prototype[properties] || [];
}
