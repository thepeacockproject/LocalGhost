// Copyright (C) 2022 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

const { cloneJsonObject } = require('./utils.js');

//#region Parsing

function parseObjectives(objectives) {
    const stateMachines = {};

    for (const obj of objectives) {

        // The game seems to not mind objectives without an ID.
        // Everywhere the game normally uses that id, an all-0 uuid gets used.
        if (!obj.Id) {
            throw new Error('Objective with no Id encountered!');
        }
        // The game seems to not mind duplicate objective IDs.
        // When checking the completion of an objective by its id, the last occurring matching objective gets checked.
        if (stateMachines[obj.Id]) {
            throw new Error(`Duplicate objective Id encountered: ${obj.Id}`);
        }
        if (obj.Type === 'statemachine') {
            if (obj.Definition) { // custom statemachine
                stateMachines[obj.Id] = {
                    currentState: 'Start',
                    inStateSince: 0,
                    context: cloneJsonObject(obj.Definition.Context),
                    stateHandlers: parseStateMachine(obj.Definition.States, obj.Definition.Context),
                    type: 'statemachine',
                }
            } else {
                throw new SyntaxError(`Objective is a statemachine without definition: ${obj.Id}`);
            }
        } else {
            // The game handles SuccessEvent/FailedEvent objectives separately;
            // I convert it to a state machine so all objectives are handled together
            stateMachines[obj.Id] = {
                currentState: 'Start',
                inStateSince: 0,
                context: {
                    "SuccessCounter": 0,
                    "FailureCounter": 0,
                    "StartCounter": 0,
                },
                stateHandlers: createSimpleStateMachine(obj),
                type: 'events',
            };
        }
    }

    return stateMachines;
}

function createSimpleStateMachine(objective) {
    const stateHandlers = {
        Start: {
            eventListeners: {},
            properTimers: [],
            dollarEventHandlers: [],
        },
        Failure: {
            eventListeners: {},
            properTimers: [],
            dollarEventHandlers: [],
        },
        Success: {
            eventListeners: {},
            properTimers: [],
            dollarEventHandlers: [],
        },
    };

    if (objective.SuccessEvent) { // simple trigger(s)
        const eventHandlers = createSimpleEventHandlers(objective.SuccessEvent.EventValues, 'Success', objective.RepeatSuccess);
        stateHandlers['Start'].eventListeners[objective.SuccessEvent.EventName] = eventHandlers;
        stateHandlers['Failure'].eventListeners[objective.SuccessEvent.EventName] = eventHandlers;
    }
    if (objective.FailedEvent) {
        if (!Object.hasOwn(stateHandlers['Start'].eventListeners, objective.FailedEvent.EventName)) {
            const eventHandlers = createSimpleEventHandlers(objective.FailedEvent.EventValues, 'Failure', objective.RepeatFailed);

            stateHandlers['Start'].eventListeners[objective.FailedEvent.EventName] = eventHandlers;
        }
    }
    if (objective.ResetEvent) {
        if (!Object.hasOwn(stateHandlers['Start'].eventListeners, objective.ResetEvent.EventName)) {
            const eventHandlers = createSimpleEventHandlers(objective.ResetEvent.EventValues, 'Start');

            stateHandlers['Success'].eventListeners[objective.ResetEvent.EventName] = eventHandlers;
            stateHandlers['Failure'].eventListeners[objective.ResetEvent.EventName] = eventHandlers;
        }
    }

    if (!objective.SuccessEvent && !objective.FailedEvent) {
        // This objective is not completable or failable. Not a big deal, but a warning might be nice.
        console.warn(`Objective of type 'events' has has no SuccessEvent or FailedEvent: ${objective.Id}`);
    }

    return stateHandlers;
}

function createSimpleEventHandlers(eventValues = {}, targetState, repeatsNeeded = 1) {
    return [
        {
            condition: conditions.and(Object.entries(eventValues).map(([key, value]) =>
                conditions.eq([parseVariableReader(`$Value.${key}`), parseVariableReader(value)])
            )),
            actions: [actions.inc(parseVariableWriter(`${targetState}Counter`))]
        },
        {
            condition: conditions.and([
                conditions.ge(parseVariableReader(`$.${targetState}Counter`), parseVariableReader(repeatsNeeded)),
                ...Object.entries(eventValues).map(([key, value]) =>
                    conditions.eq([parseVariableReader(`$Value.${key}`), parseVariableReader(value)])
                )]),
            actions: [actions.set(parseVariableWriter(`${targetState}Counter`), parseVariableReader(0))],
            transition: targetState,
        }
    ];
}

function parseStateMachine(states, initialContext) {
    const stateHandlers = {};
    for (const stateName in states) {
        const stateObj = states[stateName];
        const eventListeners = {};
        const properTimers = [];
        const dollarEventHandlers = [];

        for (const eventName in stateObj) {
            let thingsToDo = stateObj[eventName];
            // It can be an array of objects or a single object
            // If single object, put it in an array for easier handling
            if (!Array.isArray(thingsToDo)) {
                thingsToDo = [thingsToDo];
            }
            const eventHandlersForEvent = [];

            for (const thingToDo of thingsToDo) {
                const eventHandler = {
                    actions: [],
                };
                for (const property in thingToDo) {
                    if (property === 'Condition') {
                        eventHandler.condition = parseCondition(thingToDo.Condition);
                    }
                    else if (property === 'Actions') {
                        let actions = thingToDo.Actions
                        if (!Array.isArray(actions)) {
                            actions = [actions];
                        }

                        eventHandler.actions.push(...actions.flatMap(action => parseAction(action, initialContext)));
                    }
                    else if (property === 'Transition') {
                        eventHandler.transition = thingToDo.Transition;
                    }
                    else if (property.startsWith('$')) {
                        // Assume it's a loose action
                        eventHandler.actions.push(...parseAction({
                            [property]: thingToDo[property]
                        }, initialContext));
                    }
                    else {
                        // The game crashes if this happens
                        throw new SyntaxError('Invalid property encountered in state machine');
                    }
                }

                if (eventName.startsWith('$')) {
                    if (eventName === '$timer' &&
                        Object.hasOwn(thingToDo, 'Condition') && Object.hasOwn(thingToDo.Condition, '$after')) {
                        properTimers.push(eventHandler);
                    }
                    // Timers get ticked on every heartbeat, but also on every regular event
                    dollarEventHandlers.push(eventHandler);
                } else {
                    eventHandlersForEvent.push(eventHandler);
                }
            }

            eventListeners[eventName] = eventHandlersForEvent;
        }

        stateHandlers[stateName] = {
            eventListeners,
            properTimers,
            dollarEventHandlers,
        };
    }
    return stateHandlers;
}

function parseCondition(conditionObj) {
    // Most of this function is just type-checking.
    // In cases where this function throws an error, the game usually crashes upon loading the contract.

    if (typeof conditionObj !== 'object' || Array.isArray(conditionObj)) {
        throw new SyntaxError('Tried to parse a condition that is not an object!');
    }

    objectEntries = Object.entries(conditionObj).filter(([key]) => key.startsWith('$'));
    if (objectEntries.length != 1) {
        throw new SyntaxError('Unexpected number of elements in condition object (should be 1)');
    }

    const [key, val] = objectEntries[0];
    //and, or, not, gt, lt, ge, le, eq, inarray, any, all, pushunique
    switch (key) {
        case '$and':
            if (!Array.isArray(val)) {
                throw new SyntaxError('$and condition with something else than an array');
            }

            return conditions.and(val.map(subval => {
                if (typeof subval !== 'object' || Array.isArray(subval)) {
                    throw new SyntaxError('$and condition operand is something else than an object');
                }

                return parseCondition(subval);
            }));
        case '$or':
            if (!Array.isArray(val)) {
                throw new SyntaxError('$or condition with something else than an array');
            }

            return conditions.or(val.map(subval => {
                if (typeof subval !== 'object' || Array.isArray(subval)) {
                    throw new SyntaxError('$or condition operand is something else than an object');
                }

                return parseCondition(subval);
            }));
        case '$not':
            if (typeof val !== 'object' || Array.isArray(val)) {
                throw new SyntaxError('$not condition with something else than an object');
            }
            return conditions.not(parseCondition(val));
        case '$gt':
            if (!Array.isArray(val) || val.length != 2) {
                throw new SyntaxError('$gt condition with something else than an array of size 2');
            }
            for (const subval of val) {
                if (typeof subval === 'object') {
                    throw new SyntaxError('$gt condition operand is an object/array');
                }
            }

            return conditions.gt(parseVariableReader(val[0]), parseVariableReader(val[1]));
        case '$lt':
            if (!Array.isArray(val) || val.length != 2) {
                throw new SyntaxError('$lt condition with something else than an array of size 2');
            }

            for (const subval of val) {
                if (typeof subval === 'object') {
                    throw new SyntaxError('$lt condition operand is an object/array');
                }
            }

            return conditions.lt(parseVariableReader(val[0]), parseVariableReader(val[1]));
        case '$ge':
            if (!Array.isArray(val) || val.length != 2) {
                throw new SyntaxError('$ge condition with something else than an array of size 2');
            }

            for (const subval of val) {
                if (typeof subval === 'object') {
                    throw new SyntaxError('$ge condition operand is an object/array');
                }
            }

            return conditions.ge(parseVariableReader(val[0]), parseVariableReader(val[1]));
        case '$le':
            if (!Array.isArray(val) || val.length != 2) {
                throw new SyntaxError('$le condition with something else than an array of size 2');
            }

            for (const subval of val) {
                if (typeof subval === 'object') {
                    throw new SyntaxError('$le condition operand is an object/array');
                }
            }

            return conditions.le(parseVariableReader(val[0]), parseVariableReader(val[1]));
        case '$eq':
            if (!Array.isArray(val)) {
                throw new SyntaxError('$eq condition with something else than an array');
            }

            for (const subval of val) {
                if (typeof subval === 'object') {
                    throw new SyntaxError('$eq condition operand is an object/array');
                }
            }

            return conditions.eq(val.map(parseVariableReader));
        case '$inarray': // TODO: check if there is any difference between $inarray and $any
        case '$any':
            if (typeof val !== 'object' || Array.isArray(val)) {
                throw new SyntaxError('$any/$inarray condition with something else than an object');
            }
            if (!Object.hasOwn(val, '?') || !Object.hasOwn(val, 'in')) {
                throw new SyntaxError('$any/$inarray condition without "?" or "in"');
            }
            if (typeof val['?'] !== 'object' || Array.isArray(val['?'])) {
                throw new SyntaxError('$any/$inarray condition where "?" is not an object');
            }

            if (Array.isArray(val.in)) { // literal array
                return conditions.any(val.in.map(element => parseVariableReader(element)), parseCondition(val['?']));
            } else if (typeof val.in === 'string') { // array getter
                return conditions.any(parseVariableReader(val.in), parseCondition(val['?']));
            } else {
                throw new SyntaxError('$any/$inarray condition where "in" is neither an array literal nor a string');
            }
        case '$all':
            if (typeof val !== 'object') {
                throw new SyntaxError('$all condition with something else than an object');
            }
            if (!Object.hasOwn(val, '?') || !Object.hasOwn(val, 'in')) {
                throw new SyntaxError('$all condition without "?" or "in"');
            }
            if (typeof val['?'] !== 'object' || Array.isArray(val['?'])) {
                throw new SyntaxError('$all condition where "?" is not an object');
            }

            if (Array.isArray(val.in)) { // literal array
                return conditions.all(val.in.map(element => parseVariableReader(element)), parseCondition(val['?']));
            } else if (typeof val.in === 'string') { // array getter
                return conditions.all(parseVariableReader(val.in), parseCondition(val['?']));
            } else {
                throw new SyntaxError('$all condition where "in" is neither an array literal nor a string');
            }
        case '$pushunique':
            if (!Array.isArray(val) || val.length != 2) {
                throw new SyntaxError('$pushunique condition with something else than an array of size 2');
            }
            if (typeof val[0] !== 'string') {
                throw SyntaxError('$pushunique first element is not a string');
            }

            return conditions.pushunique(parseVariableWriter(val[0]), parseVariableReader(val[1]));
        case '$after':
            if (typeof val === 'object') {
                throw SyntaxError('$after operand is an object');
            }

            return conditions.after(parseVariableReader(val));
        case '$contains':
        case '$remove':
            throw new Error(`Action not yet implemented: ${key}`);
        default:
            throw new SyntaxError(`Unknown condition encountered: ${key}`);
    }
}

function parseAction(actionObj, initialContext) {
    // Most of this function is just type-checking.
    // In cases where this function throws an error, the game usually crashes upon loading the contract.

    if (typeof actionObj !== 'object' || Array.isArray(actionObj)) {
        throw new SyntaxError('Tried to parse an action that is not an object!');
    }

    return Object.entries(actionObj).map(([key, val]) => {
        //set, reset, inc, dec, mul, div, push, pushunique, remove
        switch (key) {
            case '$set':
                if (!Array.isArray(val) || val.length != 2) {
                    throw new SyntaxError('$set action with something else than an array of size 2');
                }
                if (typeof val[0] !== 'string') {
                    throw new SyntaxError('$set action first element is not a string');
                }

                return actions.set(parseVariableWriter(val[0]), parseVariableReader(val[1]));
            case '$reset':
                if (typeof val !== 'string') {
                    throw new SyntaxError('$reset action with something else than a string');
                }

                return actions.reset(parseVariableWriter(val, initialContext));
            case '$inc':
                if (Array.isArray(val)) { // addition
                    if (val.length != 2) {
                        throw new SyntaxError('$inc action with an array that has a size other than 2');
                    }
                    if (typeof val[0] !== 'string') {
                        throw new SyntaxError('$inc action (addition) where first element is not a string');
                    }
                    if (typeof val[1] !== 'string' && typeof val[1] !== 'number') {
                        throw new SyntaxError('$inc action (addition) where second element is neither a string nor a number literal');
                    }

                    return actions.add(parseVariableWriter(val[0]), parseVariableReader(val[1]));
                } else { // increment
                    if (typeof val !== 'string') {
                        throw new SyntaxError('$inc action (increment) with something else than a string');
                    }

                    return actions.inc(parseVariableWriter(val));
                }
            case '$dec':
                if (Array.isArray(val)) { // subtraction
                    if (val.length != 2) {
                        throw new SyntaxError('$dec action with an array that has a size other than 2');
                    }
                    if (typeof val[0] !== 'string') {
                        throw new SyntaxError('$dec action (subtraction) where first element is not a string');
                    }
                    if (typeof val[1] !== 'string' && typeof val[1] !== 'number') {
                        throw new SyntaxError('$dec action (subtraction) where second element is neither a string nor a number literal');
                    }

                    return actions.sub(parseVariableWriter(val[0]), parseVariableReader(val[1]));
                } else { // decrement
                    if (typeof val !== 'string') {
                        throw new SyntaxError('$dec action (decrement) with something else than a string');
                    }

                    return actions.dec(parseVariableWriter(val));
                }
            case '$mul':
                if (!Array.isArray(val) || val.length != 2) {
                    throw new SyntaxError('$mul action with something else than an array of size 2');
                }
                if (typeof val[0] !== 'string') {
                    throw new SyntaxError('$mul action where first element is not a string');
                }
                if (typeof val[1] !== 'string' && typeof val[1] !== 'number') {
                    throw new SyntaxError('$mul action where second element is neither a string nor a number literal');
                }

                return actions.mul(parseVariableWriter(val[0]), parseVariableReader(val[1]));
            case '$push':
                if (!Array.isArray(val) || val.length != 2) {
                    throw new SyntaxError('$push action with something else than an array of size 2');
                }
                if (typeof val[0] !== 'string') {
                    throw new SyntaxError('$push action first element is not a string');
                }

                return actions.push(parseVariableWriter(val[0]), parseVariableReader(val[1]));
            case '$pushunique':
                if (!Array.isArray(val) || val.length != 2) {
                    throw new SyntaxError('$pushunique action with something else than an array of size 2');
                }
                if (typeof val[0] !== 'string') {
                    throw new SyntaxError('$pushunique action first element is not a string');
                }

                return actions.pushunique(parseVariableWriter(val[0]), parseVariableReader(val[1]));
            case '$remove':
                if (!Array.isArray(val) || val.length != 2) {
                    throw new SyntaxError('$remove action with something else than an array of size 2');
                }
                if (typeof val[0] !== 'string') {
                    throw new SyntaxError('$remove action first element is not a string');
                }

                return actions.remove(parseVariableWriter(val[0]), parseVariableReader(val[1]));
            case "$select":
                if (typeof val !== 'object' || Array.isArray(val)) {
                    throw new SyntaxError('$select action with something else than an object');
                }
                if (!Object.hasOwn(val, '?') || !Object.hasOwn(val, 'in')) {
                    throw new SyntaxError('$select action without "?" or "in"');
                }
                if (typeof val['?'] !== 'object' || Array.isArray(val['?'])) {
                    throw new SyntaxError('$select action where "?" is not an object');
                }
                let actionsToRun = val['!'];
                if (actionsToRun === undefined) {
                    actionsToRun = [];
                }
                if (!Array.isArray(actionsToRun)) {
                    throw new SyntaxError('$select action where "!" is not an array');
                }

                if (Array.isArray(val.in)) { // literal array
                    return actions.select(val.in.map(elem => parseVariableReader(elem)), parseCondition(val['?']), actionsToRun.flatMap(elem => parseAction(elem, initialContext)));
                } else if (typeof val.in === 'string') { // array getter
                    return actions.select(parseVariableReader(val.in), parseCondition(val['?']), actionsToRun.flatMap(elem => parseAction(elem, initialContext)));
                } else {
                    throw new SyntaxError('$select action where "in" is neither an array literal nor a string');
                }
            case '$resetcontext':
                throw new Error(`Action not yet implemented: ${key}`);
            default:
                throw new SyntaxError(`Unknown action encountered: ${key}`);
        }
    });
}

function parseVariableReader(string) {
    const typeString = typeof string;
    if (typeString === 'object' ||
        typeString === 'number' ||
        typeString === 'boolean' ||
        typeString === 'null' ||
        !string.startsWith('$')) {
        // object, number, boolean, null or string literal
        return {
            get: () => string,
        };
    }

    if (string.startsWith('$.')) {
        const parts = string.substring(2).split('.');
        return {
            get: (context, eventVars, loopVars) => {
                let obj;
                if (/^#+$/.test(parts[0])) { // loopvar
                    // The amount of '#' chars dictate the var depth
                    // $.# is the loopvar of the outer most loop, $.## is the loopvar of the loop nested one layer within, etc.
                    obj = loopVars[parts[0].length - 1];
                } else { // context var
                    obj = context[parts[0]];
                }

                for (const part of parts.slice(1)) {
                    if (typeof obj !== 'object' || Array.isArray(obj)) {
                        return undefined;
                    }
                    obj = obj[part];
                }
                return obj;
            },
        };
    } else { // event value
        const parts = string.substring(1).split('.');
        // TODO?: weird objective completion status thingy ($uuid)?
        return {
            get: (context, eventVars, loopVars) => {
                let obj = eventVars;
                for (const part of parts) {
                    if (typeof obj !== 'object' || Array.isArray(obj)) {
                        return undefined;
                    }
                    obj = obj[part];
                }
                return obj;
            },
        };
    }
}

function parseVariableWriter(string, initialContext) {
    const parts = string.split('.');
    const lastpart = parts[parts.length - 1];

    let initialValue;
    {
        let obj = initialContext;
        for (const part of parts) {
            if (typeof obj !== 'object' || Array.isArray(obj)) {
                initialValue = undefined;
                break;
            }
            obj = obj[part];
        }
        initialValue = obj;
    }

    return {
        get: (context) => {
            let obj = context;
            for (const part of parts) {
                if (typeof obj !== 'object' || Array.isArray(obj)) {
                    return undefined;
                }
                obj = obj[part];
            }
            return obj;
        },
        set: (context, newValue) => {
            let parent = context;
            for (const part of parts.slice(0, -1)) {
                if (typeof parent !== 'object' || Array.isArray(parent)) {
                    console.warn('An objective action specified a context subprop that could not be found');
                    return;
                }

                parent = parent[part];
            }
            if (typeof parent !== 'object' || Array.isArray(parent)) {
                return;
            }

            parent[lastpart] = cloneJsonObject(newValue);
        },
        reset: (context) => {
            if (initialValue === undefined) {
                return;
            }
            let parent = context;
            for (const part of parts.slice(0, -1)) {
                if (typeof parent !== 'object' || Array.isArray(parent)) {
                    console.warn('An objective action specified a context subprop that could not be found');
                    return;
                }

                parent = parent[part];
            }
            if (typeof parent !== 'object' || Array.isArray(parent)) {
                return;
            }

            parent[lastpart] = cloneJsonObject(initialValue);
        },
        push: (context, newValue) => {
            let parent = context;
            for (const part of parts) {
                if (typeof parent !== 'object' || Array.isArray(parent)) {
                    console.warn('An objective action specified a context subprop that could not be found');
                    return;
                }

                parent = parent[part];
            }

            if (!Array.isArray(parent)) {
                console.warn('An objective action tried to push to a non-array');
                return;
            }
            if (newValue === undefined) {
                parent.push(null);
            } else {
                parent.push(newValue);
            }
        },
        pushunique: (context, newValue) => {
            let parent = context;
            for (const part of parts) {
                if (typeof parent !== 'object' || Array.isArray(parent)) {
                    console.warn('An objective action specified a context subprop that could not be found');
                    return;
                }

                parent = parent[part];
            }

            if (!Array.isArray(parent)) {
                console.warn('An objective action tried to push uniquely to a non-array');
                return false;
            }
            if (newValue === undefined) {
                return false;
            }
            if (!parent.includes(newValue)) {
                if (newValue !== null) { // don't push if value is null
                    parent.push(newValue);
                }
                return true;
            }
            return false;
        },
        remove: (context, valueToRemove) => {
            let parent = context;
            for (const part of parts) {
                if (typeof parent !== 'object' || Array.isArray(parent)) {
                    return;
                }

                parent = parent[part];
            }

            if (!Array.isArray(parent)) {
                console.warn('An objective action tried to remove an element from something that is not an array');
            }
            const index = parent.indexOf(valueToRemove);
            if (index != -1) {
                parent.splice(index, 1);
            }
        },
    };
}

//#endregion

function handleEvents(objectives, events) {
    // TODO: scope: session/hit/Hit (same thing?) or profile (challenges and such)
    // TODO: repeatable (relevant for challenges)

    // TODO: Activations, IgnoreIfInactive

    // todo?: maybe cache the stateHandlers?

    // todo test:
    //   check what happens when the game fires 'Heartbeat' events
    //   check what happens when the game fires '$timer' events
    //   multiple matching conditions actions
    //   matching conditions after transition to same state
    //   actions after transition?
    //   multiple actions/transition/condition blocks?
    //   $after condition with literal boolean/null
    //   over/underflow?
    //   Definition.Constants ?
    //   array .Count ?
    //   should $after be truncated, and/or <= instead of < ?

    // TODO: add conditions: $contains(string contains?), $remove
    // TODO: add actions: $resetcontext

    // Step 1: Parse (compile) json into functions
    const stateMachines = parseObjectives(objectives);

    // Step 2: Run the relevant functions for all events

    // Run init eventHandlers for all state machines
    handleEventAndTransitions(stateMachines, {
        Name: '-',
        Timestamp: 0,
    }, false, true);

    events.sort((a, b) => {
        return (a.Timestamp - b.Timestamp) || Number(BigInt(a.eventServerId) - BigInt(b.eventServerId));
    });

    let exited = false;
    let lastHeartbeat = 0;

    for (const event of events) {
        if (event.Name === 'exit_gate' || event.Name === 'ContractEnd' || event.Name === 'ContractFailed') {
            exited = true;
        } else if (exited) {
            continue; // don't process events that happened after we have exited the level
        }

        // First: tick timers in between the last event and this one
        // I'm ticking all proper timers with a 'Heartbeat' event every second,
        // which is approximately what the game does aswell
        while (lastHeartbeat < event.Timestamp) {
            handleEventAndTransitions(stateMachines, {
                Name: 'Heartbeat',
                Timestamp: lastHeartbeat
            }, true);
            lastHeartbeat += 1;
        }

        // Then: handle this event
        handleEventAndTransitions(stateMachines, event);
    }

    const result = {};
    for (const objectiveId in stateMachines) {
        const stateMachine = stateMachines[objectiveId];
        result[objectiveId] = {
            endState: stateMachine.currentState,
            endContext: stateMachine.context,
        };
    }
    return result;
}

function handleEventAndTransitions(stateMachines, event, timerTick = false, initEvent = false) {
    let transitionedSMs = handleSingleEvent(stateMachines, event, timerTick, initEvent);

    // Trigger init events for every SM that has transitioned to a new state
    let numberOfLoops = 0;
    while (transitionedSMs.length > 0) {
        transitionedSMs = handleSingleEvent(transitionedSMs, {
            Name: '-',
            Timestamp: event.Timestamp,
        }, false, true);
        if (numberOfLoops++ > 100000) {
            // The game might freeze, but there is no reason the server should as well :)
            console.warn(`Objectives init looped more than 100000 times: ${transitionedSMs}`);
            break;
        }
    }
}

function handleSingleEvent(stateMachines, event, timerTick = false, initEvent = false) {
    let transitionedSMs = [];
    for (const objectiveId in stateMachines) {
        const stateMachine = stateMachines[objectiveId];
        const stateHandler = stateMachine.stateHandlers[stateMachine.currentState];
        if (!stateHandler) {
            continue;
        }
        const {
            eventListeners,
            properTimers,
            dollarEventHandlers,
        } = stateHandler;
        let eventHandlersForEvent = eventListeners[event.Name] || [];
        let eventHandlers = [...eventHandlersForEvent, ...dollarEventHandlers];
        let eventVars = event;

        if (timerTick) {
            eventHandlers = properTimers;
        }
        if (initEvent) {
            // 'event' objectives don't receive init events
            if (stateMachine.type === 'events')
                continue;

            eventHandlers = eventHandlersForEvent;
            eventVars = {};
        }
        const timeInState = event.Timestamp - stateMachine.inStateSince;

        for (const eventHandler of eventHandlers) {
            if (!Object.hasOwn(eventHandler, 'condition') ||
                eventHandler.condition(stateMachine.context, eventVars, [], timeInState)) {
                if (Object.hasOwn(eventHandler, 'actions')) {
                    for (const action of eventHandler.actions) {
                        action(stateMachine.context, eventVars, [], timeInState);
                    }
                }
                if (Object.hasOwn(eventHandler, 'transition')) {
                    stateMachine.currentState = eventHandler.transition;
                    stateMachine.inStateSince = event.Timestamp;
                    transitionedSMs.push(stateMachine);
                    break;
                }
            }
        }
    }

    return transitionedSMs;
}

const conditions = {
    //and, or, not, gt, lt, ge, le, eq, inarray, any, all, pushunique, after, contains, remove
    and: function and(conditions) {
        return function $and(context, eventVars, loopVars, timeInState) {
            for (const condition of conditions) {
                if (!condition(context, eventVars, loopVars, timeInState)) {
                    return false;
                }
            }
            return true;
        };
    },
    or: function or(conditions) {
        return function $or(context, eventVars, loopVars, timeInState) {
            for (const condition of conditions) {
                if (condition(context, eventVars, loopVars, timeInState)) {
                    return true;
                }
            }
            return false;
        };
    },
    not: function not(condition) {
        return function $not(context, eventVars, loopVars, timeInState) {
            return !condition(context, eventVars, loopVars, timeInState);
        };
    },
    gt: function gt(a, b) {
        return function $gt(context, eventVars, loopVars) {
            const aValue = a.get(context, eventVars, loopVars);
            const bValue = b.get(context, eventVars, loopVars);
            if (typeof aValue !== 'number' || typeof bValue !== 'number') {
                return false;
            }

            return aValue > bValue;
        };
    },
    lt: function lt(a, b) {
        return function $lt(context, eventVars, loopVars) {
            const aValue = a.get(context, eventVars, loopVars);
            const bValue = b.get(context, eventVars, loopVars);
            if (typeof aValue !== 'number' || typeof bValue !== 'number') {
                return false;
            }

            return aValue < bValue;
        };
    },
    ge: function ge(a, b) {
        return function $ge(context, eventVars, loopVars) {
            const aValue = a.get(context, eventVars, loopVars);
            const bValue = b.get(context, eventVars, loopVars);
            if (typeof aValue !== 'number' || typeof bValue !== 'number') {
                return false;
            }

            return aValue >= bValue;
        };
    },
    le: function le(a, b) {
        return function $le(context, eventVars, loopVars) {
            const aValue = a.get(context, eventVars, loopVars);
            const bValue = b.get(context, eventVars, loopVars);
            if (typeof aValue !== 'number' || typeof bValue !== 'number') {
                return false;
            }

            return aValue <= bValue;
        };
    },
    eq: function eq(items) {
        function checkEquality(aValue, bValue) {
            if (Array.isArray(aValue) && Array.isArray(bValue) && aValue.length === bValue.length) {
                for (let i = 0; i < aValue.length; i++) {
                    if (!checkEquality(aValue[i], bValue[i]))
                        return false;
                }
                return true;
            }
            if (aValue === undefined || typeof aValue === 'object' ||
                bValue === undefined || typeof bValue === 'object') {
                return false;
            }

            return aValue === bValue;
        }

        return function $eq(context, eventVars, loopVars) {
            if (items.length === 0)
                return true;

            const firstValue = items[0].get(context, eventVars, loopVars);
            for (const otherItems of items.slice(1)) {
                if (!checkEquality(firstValue, otherItems.get(context, eventVars, loopVars)))
                    return false;
            }
            return firstValue != null; // value is not null or undefined
        };
    },
    any: function any(items, condition) {
        if (Array.isArray(items)) { // literal array
            return function $any(context, eventVars, loopVars, timeInState) {
                for (const item of items) {
                    const itemValue = item.get(context, eventVars, loopVars);
                    loopVars.push(itemValue);
                    // treat condition as false if item is null or undefined
                    if (condition(context, eventVars, loopVars, timeInState) && itemValue != null) {
                        loopVars.pop();
                        return true;
                    }
                    loopVars.pop();
                }
                return false;
            };
        } else { // array getter
            return function $any(context, eventVars, loopVars, timeInState) {
                const arrayObj = items.get(context, eventVars, loopVars);
                if (!Array.isArray(arrayObj)) {
                    return false;
                }

                for (const item of arrayObj) {
                    loopVars.push(item);
                    // treat condition as false if item is null or undefined
                    if (condition(context, eventVars, loopVars, timeInState) && item != null) {
                        loopVars.pop();
                        return true;
                    }
                    loopVars.pop();
                }
                return false;
            };
        }
    },
    all: function all(items, condition) {
        if (Array.isArray(items)) { // literal array
            return function $all(context, eventVars, loopVars, timeInState) {
                for (const item of items) {
                    const itemValue = item.get(context, eventVars, loopVars)
                    loopVars.push(itemValue);
                    // treat condition as false if item is null or undefined
                    if (!condition(context, eventVars, loopVars, timeInState) || itemValue == null) {
                        loopVars.pop();
                        return false;
                    }
                    loopVars.pop();
                }
                return true;
            };
        } else { // array getter
            return function $all(context, eventVars, loopVars, timeInState) {
                const arrayObj = items.get(context, eventVars, loopVars);
                if (!Array.isArray(arrayObj)) {
                    return false;
                }

                for (const item of arrayObj) {
                    loopVars.push(item);
                    // treat condition as false if item is null or undefined
                    if (!condition(context, eventVars, loopVars, timeInState) || item == null) {
                        loopVars.pop();
                        return false;
                    }
                    loopVars.pop();
                }
                return true;
            };
        }
    },
    pushunique: function pushunique(array, item) {
        return function $pushunique(context, eventVars, loopVars) {
            const itemValue = item.get(context, eventVars, loopVars);
            return array.pushunique(context, itemValue);
        };
    },
    after: function after(timeout) {
        return function $after(context, eventVars, loopVars, timeInState) {
            return timeInState > timeout.get(context, eventVars, loopVars);
        }
    }
}

const actions = {
    //set, reset, inc, dec, mul, div, push, pushunique, remove, resetcontext, select
    set: function set(item, value) {
        return function $set(context, eventVars, loopVars) {
            item.set(context, value.get(context, eventVars, loopVars));
        };
    },
    reset: function reset(item) {
        return function $reset(context, eventVars, loopVars) {
            item.reset(context);
        };
    },
    inc: function inc(item) {
        return function $inc(context, eventVars, loopVars) {
            const itemValue = item.get(context, eventVars, loopVars);
            if (typeof itemValue !== 'number') {
                return;
            }

            item.set(context, itemValue + 1);
        };
    },
    add: function add(item, toAdd) {
        return function $add(context, eventVars, loopVars) {
            const itemValue = item.get(context, eventVars, loopVars);
            if (typeof itemValue !== 'number') {
                return;
            }
            let toAddValue = toAdd.get(context, eventVars, loopVars);
            if (typeof toAddValue !== 'number') {
                toAddValue = 1;
            }
            item.set(context, itemValue + toAddValue);
        };
    },
    dec: function dec(item) {
        return function $dec(context, eventVars, loopVars) {
            const itemValue = item.get(context, eventVars, loopVars);
            if (typeof itemValue !== 'number') {
                return;
            }

            item.set(context, itemValue - 1);
        };
    },
    sub: function sub(item, toSub) {
        return function $sub(context, eventVars, loopVars) {
            const itemValue = item.get(context, eventVars, loopVars);
            if (typeof itemValue !== 'number') {
                return;
            }
            let toSubValue = toSub.get(context, eventVars, loopVars);
            if (typeof toSubValue !== 'number') {
                toSubValue = 1;
            }
            item.set(context, itemValue - toSubValue);
        };
    },
    mul: function mul(item, multiplier) {
        return function $mul(context, eventVars, loopVars) {
            const itemValue = item.get(context, eventVars, loopVars);
            if (typeof itemValue !== 'number') {
                return;
            }
            const multiplierValue = multiplier.get(context, eventVars, loopVars);
            if (typeof multiplierValue !== 'number') {
                return;
            }
            item.set(context, itemValue * multiplierValue);
        };
    },
    push: function push(array, item) {
        return function $push(context, eventVars, loopVars) {
            array.push(context, item.get(context, eventVars, loopVars));
        };
    },
    pushunique: function pushunique(array, item) {
        return function $pushunique(context, eventVars, loopVars) {
            array.pushunique(context, item.get(context, eventVars, loopVars));
        };
    },
    remove: function remove(array, item) {
        return function $remove(context, eventVars, loopVars) {
            array.remove(item.get(context, eventVars, loopVars));
        };
    },
    select: function select(items, condition, actionsToRun) {
        if (Array.isArray(items)) { // literal array
            return function $select(context, eventVars, loopVars, timeInState) {
                for (const item of items) {
                    const itemValue = item.get(context, eventVars, loopVars)
                    loopVars.push(itemValue);

                    // treat condition as false if item is null or undefined
                    if (condition(context, eventVars, loopVars, timeInState) && itemValue != null) {
                        for (const action of actionsToRun) {
                            action(context, eventVars, loopVars, timeInState);
                        }
                    }
                    loopVars.pop();
                }
            };
        } else { // array getter
            return function $select(context, eventVars, loopVars, timeInState) {
                const arrayObj = items.get(context, eventVars, loopVars);
                if (!Array.isArray(arrayObj)) {
                    return;
                }

                for (const item of arrayObj) {
                    loopVars.push(item);

                    // treat condition as false if item is null or undefined
                    if (condition(context, eventVars, loopVars, timeInState) && item != null) {
                        for (const action of actionsToRun) {
                            action(context, eventVars, loopVars, timeInState);
                        }
                    }
                    loopVars.pop();
                }
            };
        }
    }
}


module.exports = {
    handleEvents,
};