/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { BeEvent } from "@itwin/core-bentley";
import { ColorDef, FeatureOverrideType } from "@itwin/core-common";
import { EmphasizeElements, IModelApp, ViewChangeOptions } from "@itwin/core-frontend";
import ClashDetectionClient from "./ClashDetectionClient";
import { jsonData } from "./ClashDetectionJsonData";
import { Point3d, } from "@itwin/core-geometry";

export interface MarkerData {
  point: Point3d;
  title?: string;         // override default marker tooltip title
  description?: string;   // override default marker tooltip description
  data?: any;
}

export default class ClashReviewApi {

  public static onClashDataChanged = new BeEvent<any>();
  public static onTestRunDataChanged = new BeEvent<any>();
  public static onTestDataChanged = new BeEvent<any>();
  public static onSRsDataChanged = new BeEvent<any>();

  private static _clashData: { [id: string]: any } = {};
  private static _testRunData: { [id: string]: any } = {};
  private static _testsData: { [id: string]: any } = {};
  private static _SRsData: { [id: string]: any } = {};
  
  private static _applyZoom: boolean = true;

  public static enableZoom() {
    ClashReviewApi._applyZoom = true;
  }

  public static disableZoom() {
    ClashReviewApi._applyZoom = false;
  }

  public static async getAndsetClashData(projectId: string): Promise<void> {
    const clashData = await ClashReviewApi.getClashData(projectId);
    ClashReviewApi.onClashDataChanged.raiseEvent(clashData);
  }

  public static async getTestRunsData(projectId: string): Promise<void> {
    const testRunsData = await ClashReviewApi.getTestRunData(projectId);
    ClashReviewApi.onTestRunDataChanged.raiseEvent(testRunsData);
  }

  public static async getTestsData(projectId: string): Promise<void> {
    const testsData = await ClashReviewApi.getProjectTestsData(projectId);
    ClashReviewApi.onTestDataChanged.raiseEvent(testsData);
    return testsData;
  }  

  public static async getSRsData(projectId: string): Promise<void> {
    const SRsData = await ClashReviewApi.getSuppressionRuleData(projectId);
    ClashReviewApi.onSRsDataChanged.raiseEvent(SRsData);
  }
  

  public static async getTestRunData(projectId: string): Promise<any> {
    if (ClashReviewApi._testRunData[projectId] === undefined) {
      // const runsResponse = await ClashDetectionClient.getClashTestRuns(projectId);
      const runsResponse = await ClashDetectionClient.getAllRuns(projectId);
      if (runsResponse !== undefined && runsResponse.runs !== undefined && runsResponse.runs.length !== 0) {
          ClashReviewApi._testRunData[projectId] = runsResponse.runs;
      }
    }

    return ClashReviewApi._testRunData[projectId];
  }


  public static async getProjectTestsData(projectId: string): Promise<any> {
    if (ClashReviewApi._testsData[projectId] === undefined) {
      const runsResponse = await ClashDetectionClient.getAllTests(projectId);
      if (runsResponse !== undefined && runsResponse.tests !== undefined && runsResponse.tests.length !== 0) {
          ClashReviewApi._testsData[projectId] = runsResponse.tests;
      }
    }

    return ClashReviewApi._testsData[projectId];
  }


  public static async getUpdatedTestsData(projectId: string): Promise<any> {
      const runsResponse = await ClashDetectionClient.getAllTests(projectId);
      if (runsResponse !== undefined && runsResponse.tests !== undefined && runsResponse.tests.length !== 0) {
          ClashReviewApi._testsData[projectId] = runsResponse.tests;
    }
    if (runsResponse)
      ClashReviewApi.onTestDataChanged.raiseEvent(runsResponse.tests);

    return runsResponse;
  }

  public static async getSuppressionRuleData(projectId: string): Promise<any> {
    if (ClashReviewApi._SRsData[projectId] === undefined) {
      const SRsResponse = await ClashDetectionClient.getSRs(projectId);
      if (SRsResponse !== undefined && SRsResponse.suppressionRules.length !== 0) {
          ClashReviewApi._SRsData[projectId] = SRsResponse.suppressionRules;
      }
    }

    return ClashReviewApi._SRsData[projectId];
  }
  
  public static async createTest(): Promise<any> {
    await ClashDetectionClient.createTest();
  }

  public static async updateTest(testId: string): Promise<any> {
    await ClashDetectionClient.updateTest(testId);
  }
  public static async startTestRun(): Promise<any> {
      const testRun = await ClashDetectionClient.runTest();
      console.log(testRun);
    }


  public static async getClashData(projectId: string): Promise<any> {

    if (ClashReviewApi._clashData[projectId] === undefined) {
      // const runsResponse = await ClashDetectionClient.getClashTestRuns(projectId);
      const runsResponse = await ClashDetectionClient.getAllRuns(projectId);
      if (runsResponse !== undefined && runsResponse.runs !== undefined && runsResponse.runs.length !== 0) {
        // Get validation result
        const resultResponse = await ClashReviewApi.getResultDetailsForId(runsResponse.runs[0]._links.result.href);
        if (resultResponse !== undefined && resultResponse.result !== undefined)
          ClashReviewApi._clashData[projectId] = resultResponse;
      }
      // if (ClashReviewApi._clashData[projectId] === undefined) {
      //   ClashReviewApi._clashData[projectId] = jsonData;
      // }
    }

    return ClashReviewApi._clashData[projectId];
  }

  public static async getResultDetailsForId(resultIdURl: string): Promise<any> {
    const resultData = await ClashDetectionClient.getValidationUrlResponse(resultIdURl);
    return resultData;
  }

  public static async getClashMarkersData(iModelConnection: any, clashData: any): Promise<MarkerData[]> {
    const markersData: MarkerData[] = [];
    if (iModelConnection && clashData) {
      for (const result of clashData.result) {
        const title = "Collision(s) found:";
        const description = `Element A: ${result.elementALabel}<br>Element B: ${result.elementBLabel}`;
        const clashMarkerData: MarkerData = { point: result.center, data: result, title, description };
        markersData.push(clashMarkerData);
      }
    }
    return markersData;
  }

  public static visualizeClashCallback = (clashData: any) => {
    ClashReviewApi.visualizeClash(clashData.elementAId, clashData.elementBId);
  };

  public static updateClashResultsTable = async (index: number) => {
        const runs = ClashReviewApi._testRunData["b7225578-8bb8-40b6-bbf2-8a4eae5aa0ba"];
        const runData = runs[index];
        const clashData = await ClashReviewApi.getResultDetailsForId(runData._links.result.href);
        ClashReviewApi.onClashDataChanged.raiseEvent(clashData);
  };

  public static visualizeClash(elementAId: string, elementBId: string) {
    if (!IModelApp.viewManager.selectedView)
      return;

    const vp = IModelApp.viewManager.selectedView;
    const provider = EmphasizeElements.getOrCreate(vp);
    provider.clearEmphasizedElements(vp);
    provider.clearOverriddenElements(vp);
    provider.overrideElements(elementAId, vp, ColorDef.red, FeatureOverrideType.ColorOnly, true);
    provider.overrideElements(elementBId, vp, ColorDef.blue, FeatureOverrideType.ColorOnly, false);
    provider.wantEmphasis = true;
    provider.emphasizeElements([elementAId, elementBId], vp, undefined, false);

    if (ClashReviewApi._applyZoom) {
      const viewChangeOpts: ViewChangeOptions = {};
      viewChangeOpts.animateFrustumChange = true;
      vp.zoomToElements([elementAId, elementBId], { ...viewChangeOpts })
        .catch((error) => {
          console.error(error);
        });
    }
  }

  public static resetDisplay() {
    if (!IModelApp.viewManager.selectedView)
      return;

    const vp = IModelApp.viewManager.selectedView;
    const provider = EmphasizeElements.getOrCreate(vp);
    provider.clearEmphasizedElements(vp);
    provider.clearOverriddenElements(vp);
  }

  
  public static getTestRuns() {

  }
}
