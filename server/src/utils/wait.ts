export function wait(number: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, number);
  });
}

export function waitForSeconds(seconds: number): Promise<void> {
  const milliseconds = seconds * 1000;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
}
