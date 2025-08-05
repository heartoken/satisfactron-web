export const toHHMM = (timeObj: any) => {
  const h = String(timeObj.hour).padStart(2, "0");
  const m = String(timeObj.minute).padStart(2, "0");
  return `${h}:${m}`;
};
