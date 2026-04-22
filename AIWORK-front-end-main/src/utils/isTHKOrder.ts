export const isTHKOrder = (orderCode: unknown): boolean => {
  if (typeof orderCode !== 'string' || orderCode.length !== 13) {
    return false;
  }
  return orderCode.startsWith('THK');
};
