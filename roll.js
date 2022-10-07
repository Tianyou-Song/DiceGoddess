import _ from 'lodash';
import crypto from 'crypto';

export const attempt = params => {
    const {
        diceCount,
        difficulty,
        focus,
        has6as2,
    } = params;

    const originalRolls = Array.from(
        {
            length: diceCount,
        },
        () => crypto.randomInt(1, 7)
    );

    const newRolls = _.cloneDeep(originalRolls);

    const indexesChanged = {};
    let
        differenceTo6,
        differenceToPass,
        focusLeft = focus,
        foundIdx,
        rollsToFind = 5;

    while (focusLeft > 0 && rollsToFind > 0) {
        differenceTo6 = 6 - rollsToFind;
        differenceToPass = difficulty - rollsToFind;

        if (focusLeft < differenceToPass) {
            break;
        }

        foundIdx = newRolls.findIndex(roll => roll === rollsToFind);

        if (
            (foundIdx === -1) ||
            (!has6as2 && (differenceToPass <= 0)) ||
            (has6as2 && (differenceToPass <= 0) && (focusLeft < differenceTo6))
        ) {
            rollsToFind--;
            continue;
        }

        if (
            has6as2 &&
            (focusLeft >= differenceTo6) &&
            (differenceTo6 <= 2)
        ) {
            newRolls[foundIdx] = 6;
            indexesChanged[foundIdx] = true;
            focusLeft -= differenceTo6;
            continue;
        }

        if (
            (differenceToPass === 1) &&
            (focusLeft >= differenceToPass)
        ) {
            newRolls[foundIdx] += differenceToPass;
            indexesChanged[foundIdx] = true;
            focusLeft -= differenceToPass;
            rollsToFind += differenceToPass;
            continue;
        }

        if (
            has6as2 &&
            (focusLeft >= differenceTo6) &&
            (differenceTo6 <= 4)
        ) {
            newRolls[foundIdx] = 6;
            indexesChanged[foundIdx] = true;
            focusLeft -= differenceTo6;
            continue;
        }

        if (
            (differenceToPass <= 2) &&
            (focusLeft >= differenceToPass)
        ) {
            newRolls[foundIdx] += differenceToPass;
            indexesChanged[foundIdx] = true;
            focusLeft -= differenceToPass;
            rollsToFind += differenceToPass;
            continue;
        }

        if (
            has6as2 &&
            (focusLeft >= differenceTo6)
        ) {
            newRolls[foundIdx] = 6;
            indexesChanged[foundIdx] = true;
            focusLeft -= differenceTo6;
            continue;
        }

        if (
            focusLeft >= differenceToPass
        ) {
            newRolls[foundIdx] += differenceToPass;
            indexesChanged[foundIdx] = true;
            focusLeft -= differenceToPass;
            rollsToFind += differenceToPass;
            continue;
        }

        rollsToFind--;
    }

    let difference = 1;
    while (focusLeft > 0 && difference < 6) {
        foundIdx = newRolls.findIndex(roll => 6 - roll === difference);
        if (foundIdx !== -1) {
            newRolls[foundIdx]++;
            indexesChanged[foundIdx] = true;
            difference = 1;
            focusLeft--;
            continue;
        }
        difference++;

        if (newRolls.every(roll => roll === 6)) {
            break;
        }
    }

    const indexSix = newRolls.reduce((accumulator, roll, idx) => {
        if (roll === 6) {
            accumulator[idx] = true;
        }

        return accumulator;
    }, {});
    const indexesSuccess = newRolls.reduce((accumulator, roll, idx) => {
        if (roll >= difficulty) {
            accumulator[idx] = true;
        }

        return accumulator;
    }, {});
    const indexFailure = newRolls.reduce((accumulator, roll, idx) => {
        if (roll < difficulty) {
            accumulator[idx] = true;
        }

        return accumulator;
    }, {});

    let successes = Object.keys(indexesSuccess).length;
    const sixes = Object.keys(indexSix).length;

    if (has6as2) {
        successes += sixes;
        Object.keys(indexSix).forEach(idx => newRolls[idx] = `__${newRolls[idx]}__`)
    }

    Object.keys(indexesChanged).forEach(idx => newRolls[idx] = `**${newRolls[idx]}**`);
    Object.keys(indexFailure).forEach(idx => newRolls[idx] = `~~${newRolls[idx]}~~`);

    return {
        newRolls,
        originalRolls,
        sixes,
        successes,
    }
}

export const rollAll = params => {
    const {
        attempts,
        complexity,
        diceCount,
        difficulty,
        focus,
        has6as2,
    } = params;

    const results = {
        rolls: [],
        sixes: 0,
        successes: 0,
    };

    let
        originalRolls,
        newRolls,
        successes;

    for (let i = 0; i < attempts; i++) {
        ({ originalRolls, newRolls, sixes, successes }) = attempt(params);
        results.rolls.push({ originalRolls, newRolls });
        results.sixes += sixes;
        results.successes += successes;
    }

    let outLines = [`DN: ${difficulty}:${complexity}, rolling: ${diceCount}d6, Focus: ${focus}, 6 Counts as 2 Successes: ${has6as2}`];

    outLines = outLines.concat(results.rolls.reduce((accumulator, rollResult, idx) => {
        ({ originalRolls, newRolls }) = rollResult;
        return accumulator.concat(
            `${originalRolls.join(', ')} Attempt ${idx + 1}`
        ).concat(
            `${newRolls.join(', ')} after Focus`
        );
    }, []));

    outLines = outlines.concat([
        `6's: ${results.sixes}`,
        `Successes: ${results.successes}, Complexity: ${complexity}`,
    ]);

    if (results.successes >= complexity) {
        outLines.push(
            `SUCCESS! Additional Successes: ${results.successes - complexity}`
        );
    } else {
        outLines.push(
            'FAIL!'
        );
    };

    return outLines.join('\n');
}