// retourne un objet avec infos de Date qui vont etre utiles pour les composants
export default function getDatasCurrentTime()
{
  const curTime = new Date();

  return ({
    curTime,
    year: curTime.getFullYear(),
    month: curTime.getMonth(),
    dayOfMonth: curTime.getDate(),
    dayOfWeek: curTime.getDay(),
    hours: curTime.getHours(),
    minutes: curTime.getMinutes(),
    seconds: curTime.getSeconds()
  });
}