export const sleep = (duration = 500) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, duration);
  });
