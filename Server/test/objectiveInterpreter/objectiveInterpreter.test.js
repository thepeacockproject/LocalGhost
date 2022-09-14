// Copyright (C) 2022 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

const objectiveInterpreter = require('../../components/objectiveInterpreter.js');
const fs = require('fs');
const path = require('path');

const testCaseFiles = fs.readdirSync(path.join(__dirname, 'testCases'));
const testCases = testCaseFiles.map(fileName => {
    const testCase = JSON.parse(fs.readFileSync(path.join(__dirname, 'testCases', fileName)))
    return [fileName, testCase.Description, testCase];
});

describe('Test the objective interpreter', () => {
    describe.each(testCases)('%s: %s', (fileName, description, testCase) => {
        test.each(testCase.Tests)('$Description', (test) => {
            const interpreterResults = objectiveInterpreter.handleEvents(testCase.Contract.Data.Objectives, test.Events || []);
            for (const expectedResult of test.ExpectedResults) {
                if (expectedResult.ExpectedSuccess === true)
                    expect(interpreterResults[expectedResult.ObjectiveId].endState).toBe('Success');
                else if (expectedResult.ExpectedSuccess === false)
                    expect(interpreterResults[expectedResult.ObjectiveId].endState).not.toBe('Success');
                else
                    throw new Error('Test did not check any results');
            }
        });
    });
});