function supermemo(item, grade) {
  let nextInterval;
  let nextRepetition;
  let nextEfactor;

  // if (grade >= 3) {
  //   if (item.interval < 5) item.interval = 5;
  // }

  // Learning phase
  nextEfactor = item.efactor + (0.1 - (5 - grade) * (0.18 + (5 - grade) * 0.06));

  if (grade === 2) {
    nextInterval = Math.round(item.interval * 0.75);
    nextRepetition = item.repetition + 1;
  } else if (grade === 1) {
    nextInterval = Math.round(item.interval * 0.5);
    nextRepetition = item.repetition + 1;
  } else if (grade === 0) {
    nextInterval = 1;
    nextRepetition = item.repetition + 1;
  } else {
    nextInterval = Math.round(item.interval * nextEfactor);
    nextRepetition = item.repetition + 1;
  }

  if (nextInterval < 1) nextInterval = 1;

  if (nextEfactor < 1.3) {
    nextEfactor = 1.3;
    nextInterval = 1;
  }

  return {
    interval: nextInterval,
    repetition: nextRepetition,
    efactor: nextEfactor,
  };
}

module.exports = supermemo;
