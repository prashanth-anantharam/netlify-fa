/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelApp } from "@itwin/core-frontend";
import { request } from "http";
import {ClashDetectionTestsInterface, 
        ClashDetectRunInterface, 
        ClashDetectionRunDetailInterface, 
        ClashDetectionRunsInterface, 
        ClashDetectionSRsInterface} from "./ClashDetectionInterfaces";
import { jsonData } from "./ClashDetectionJsonData";
import { runTestRequestBody, updateTestRequestBody, createTestRequestBody } from "./ClashDetectionTestJsonData";

interface FetchResponse<T> extends Response {
  data?: T;
}

export default class ClashDetectionClient {

  /** Returns the access token which will be used for all the API calls made by the frontend. */
  private static async getAccessToken() {
    if (!IModelApp.authorizationClient)
      throw new Error("AuthorizationClient is not defined. Most likely IModelApp.startup was not called yet.");

    return IModelApp.authorizationClient.getAccessToken();
  }

  private static readonly BASE_URL = "https://api.bentley.com/clashdetection";

  private static buildGETFetchOptions(accessToken: string): RequestInit {
    return {
      method: "GET",
      headers: {
        Prefer: "return=representation",
        Accept: "application/vnd.bentley.itwin-platform.v1+json",
        Authorization: accessToken,
      },
    };
  }

  private static buildPOSTFetchOptions(accessToken: string, requestBody: string): RequestInit {
    return {
      method: "POST",
      headers: {
        Prefer: "return=representation",
        Accept: "application/vnd.bentley.itwin-platform.v1+json",
        Authorization: accessToken,
      },
      body: requestBody
    };
  }

  private static buildPUTFetchOptions(accessToken: string, requestBody: string): RequestInit {
    return {
      method: "PUT",
      headers: {
        Prefer: "return=representation",
        Accept: "application/vnd.bentley.itwin-platform.v1+json",
        Authorization: accessToken,
      },
      body: requestBody
    };
  }

    /**
   * Fetches data from the service referenced by url.
   * @param url name of the url from where we're fetching data.
   * @returns Promise<T | undefined>
   */
     private static async getFetchResponse<T>(url: string): Promise<T | undefined> {
      const accessToken = await ClashDetectionClient.getAccessToken();
      const options = this.buildGETFetchOptions(accessToken);
      const response: FetchResponse<T> = await fetch(url, options);
      if (response.ok) {
        response.data = await response.json();
      } else {
        console.log(`Error on fetch, ${response.status}`);
        response.data = undefined;
      }
      return response.data;
    }


    private static async postFetchResponse<T>(url: string, requestBody: string): Promise<T | undefined> {
      const accessToken = await ClashDetectionClient.getAccessToken();
      const options = this.buildPOSTFetchOptions(accessToken,requestBody );
      const response: FetchResponse<T> = await fetch(url, options);
      if (response.ok) {
        response.data = await response.json();
      } else {
        console.log(`Error on fetch, ${response.status}`);
        response.data = undefined;
      }
      return response.data;
    }

    private static async putFetchResponse<T>(url: string, requestBody: string): Promise<T | undefined> {
      const accessToken = await ClashDetectionClient.getAccessToken();
      const options = this.buildPUTFetchOptions(accessToken,requestBody );
      const response: FetchResponse<T> = await fetch(url, options);
      if (response.ok) {
        response.data = await response.json();
      } else {
        console.log(`Error on fetch, ${response.status}`);
        response.data = undefined;
      }
      return response.data;
    }    

    /**
   * Retrieves a list of tests for the given context.
   * @param projectId contextId.
   * @see https://api.bentley.com/clashdetection/tests?projectId
   * @returns Promise<SavedViewsResponseInterface>
   */
  public static async getAllTests(iTwinId: string): Promise<ClashDetectionTestsInterface | undefined> {
    let url = `${this.BASE_URL}/tests?projectId=${iTwinId}`;
    return this.getFetchResponse<ClashDetectionTestsInterface>(url);
  }
  public static async getSRs(iTwinId: string): Promise<ClashDetectionSRsInterface | undefined> {
    let url = `${this.BASE_URL}/suppressionRules?projectId=${iTwinId}`;
    return this.getFetchResponse<ClashDetectionSRsInterface>(url);
  }

  public static async getAllRuns(iTwinId: string): Promise<ClashDetectionRunsInterface | undefined> {
    let url = `${this.BASE_URL}/runs?projectId=${iTwinId}`;
    return this.getFetchResponse<ClashDetectionRunsInterface>(url);
  }

  public static async runTest(): Promise<ClashDetectRunInterface | undefined> {
    let url = `${this.BASE_URL}/runs`;
    return this.postFetchResponse<ClashDetectRunInterface>(url, runTestRequestBody);
  }

  public static async createSuppressionRule(testId: string, imodelId: string, namedVersion: string): Promise<ClashDetectRunInterface | undefined> {
    let url = `${this.BASE_URL}/runs`;
    const requestBody = {testId: testId, iModelId: imodelId, namedVersionId: namedVersion};
    return this.postFetchResponse<ClashDetectRunInterface>(url, JSON.stringify(requestBody));
  }

  public static async createTest(): Promise<ClashDetectRunInterface | undefined> {
    let url = `${this.BASE_URL}/tests`;
    return this.postFetchResponse<ClashDetectRunInterface>(url, createTestRequestBody);
  }

  public static async updateTest(testId: string): Promise<ClashDetectRunInterface | undefined> {
    let url = `${this.BASE_URL}/tests/${testId}`;
    return this.putFetchResponse<ClashDetectRunInterface>(url, updateTestRequestBody);
  }

  public static async getRunDetails(runId: string): Promise<ClashDetectionRunDetailInterface | undefined> {
    let url = `${this.BASE_URL}/runs/${runId}`;
    return this.getFetchResponse<ClashDetectionRunDetailInterface>(url);
  }

  public static async getResultDetails(resultId: string) {
  //  let url = `${this.BASE_URL}results/{resultId}`;

  // Get validation result
  const resultResponse = await ClashDetectionClient.getValidationUrlResponse(resultId);
  if (resultResponse !== undefined && resultResponse.result !== undefined)
    return resultResponse;
   else
    return jsonData;
  }

  /**
   * Get all group by iTwin ID and iModel ID.
   * @param iTwinId name of the iTwin ID.
   * @param iModelId name of the iModel ID.
   * @see https://developer.bentley.com/apis/savedviews/operations/get-all-groups/
   * @returns Promise<GroupsResponseInterface>
   */
  // public static async getAllGroupsAsync(iTwinId: string, iModelId?: string): Promise<GroupsResponseInterface | undefined> {
  //   let url = `${this.BASE_URL}/groups?iTwinId=${iTwinId}`;
  //   if (iModelId) {
  //     url = `${url}&iModelId=${iModelId}`;
  //   }
  //   return this.getFetchResponse<GroupsResponseInterface>(url);
  // }

  // /**
  //  * Gets saved view by saved view ID.
  //  * @param savedViewId name of the saved view ID.
  //  * @see https://developer.bentley.com/apis/savedviews/operations/get-savedview/
  //  * @returns Promise<SavedViewDetailResponseInterface>
  //  */
  // public static async getByIdAsync(savedViewId: string): Promise<SavedViewDetailResponseInterface | undefined> {
  //   const url = `${this.BASE_URL}/${savedViewId}`;
  //   return this.getFetchResponse<SavedViewDetailResponseInterface>(url);
  // }

  // /**
  //  * Retrieves saved view thumbnail url.
  //  * @param imageUrl name of the saved view image URL.
  //  * @see https://developer.bentley.com/apis/savedviews/operations/get-image/
  //  * @returns Promise<LinkInterface>
  //  */
  // public static async getThumbnailUrlAsync(imageUrl: string): Promise<LinkInterface | undefined> {
  //   return this.getFetchResponse<LinkInterface>(imageUrl);
  // }
  

  // Retrieves a list of clash detection test runs for the project specified by the project id.
  public static async getClashTestRuns(projectId: string): Promise<any | undefined> {
    console.log("Function: getClashTestRuns.");
    const accessToken = await ClashDetectionClient.getAccessToken();
    const url = `https://api.bentley.com/clashdetection/runs?projectId=${projectId}`;
    const options = {
      method: "GET",
      headers: {
        Prefer: "return=representation",
        Accept: "application/vnd.bentley.itwin-platform.v1+json",
        Authorization: accessToken,
      },
    };

    return fetch(url, options)
      .then(async (response) => {
        if (!response.ok)
          throw new Error(response.statusText);
        return response.json();
      })
      .catch((error) => {
        console.error(error);
        return undefined;
      });
  }

  // Gets the response body for the specified validation URL.
  public static async getValidationUrlResponse(url: string) {
    if (url === undefined)
      return undefined;

    const accessToken = await ClashDetectionClient.getAccessToken();
    const options = {
      method: "GET",
      headers: {
        Authorization: accessToken,
      },
    };

    return fetch(url, options)
      .then(async (response) => {
        if (!response.ok)
          throw new Error(response.statusText);
        return response.json();
      })
      .catch((error) => {
        console.error(error);
        return undefined;
      });
  }
}
