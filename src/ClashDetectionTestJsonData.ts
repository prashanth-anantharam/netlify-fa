/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

// Clash Detection Tests Sample Data
export const createTestRequestBody = `{
    "projectId": "b7225578-8bb8-40b6-bbf2-8a4eae5aa0ba",
    "displayName": "PA-Devcon-NoSuppressionRule",
    "description": "Test to demonstrate clash detection",
    "setA": {
        "modelIds": [],
        "categoryIds": ["0x20000000185"],
        "selfCheck": true,
        "clearance": 0.001
    },
    "setB": {
        "modelIds": [],
        "categoryIds": ["0x20000000181"],
        "selfCheck": false,
        "clearance": 0
    },
    "suppressTouching": false,
    "touchingTolerance": 0,
    "includeSubModels": false,
    "suppressionRules": []
}`;

export const updateTestRequestBody = `{
    "displayName": "PA-Devcon-SuppressionRule",
    "description": "Test to demonstrate clash detection with suppression rule",
    "setA": {
        "modelIds": [],
        "categoryIds": ["0x20000000185"],
        "selfCheck": true,
        "clearance": 0.001
    },
    "setB": {
        "modelIds": [],
        "categoryIds": ["0x20000000181"],
        "selfCheck": false,
        "clearance": 0
    },
    "suppressTouching": false,
    "touchingTolerance": 0,
    "includeSubModels": false,
    "suppressionRules": ["eFUit7iLtkC78opOrlqguvT9YUJEegxIigDi8M0IWic"]
}`;

// POST: Run updated clash test. https://api.bentley.com/clashdetection/tests/{id}
export const runTestRequestBody = `{
    "testId": "eFUit7iLtkC78opOrlqguqHjZtXVa6tKt481LWySyP0",
    "iModelId": "831ed224-a0ac-4edb-91a1-56be3aeab903",
    "namedVersionId": "03e3c7b8-1ca1-4126-bbb0-bf368200922b",
}`;


// GET: 
export const suppressionRuleData = `{
    "projectId": "b7225578-8bb8-40b6-bbf2-8a4eae5aa0ba",
    "displayName": "OBM_Caps and OBM_GirderConcrete",
    "reason": "Mark clashes between OBM caps and girderconrete as suppressed",
    "templateId": "eFUit7iLtkC78opOrlqguoB8Gm_UYqVMkZ7UnPdlrsE",
    "parameters": {
        "likeExpression": {
            "value": "OBM_Caps"
        }
    }
	}`;

