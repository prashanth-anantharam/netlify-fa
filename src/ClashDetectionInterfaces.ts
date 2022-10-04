import { CameraProps } from "@itwin/core-common";
import { TransformProps, XYProps, XYZProps, YawPitchRollProps } from "@itwin/core-geometry";

/**
 * Saved view link interface for hyperlink references.
 */
 export interface LinkInterface {
    /**
     * Hyperlink reference.
     */
    href: string;
  }

   export interface NextTokenInterface {
    /**
     * Hyperlink reference.
     */
    next: LinkInterface;
  }

  export interface TestMetaDataInterface {
    createdBy: LinkInterface;
    lastModifiedBy: LinkInterface;
    test: LinkInterface;


  }
  export interface ClashDetectionTestInterface {
    id: string;
    displayName: string;
    description: string;
    creationDateTime: string;
    modificationDateTime: string;
    _links: TestMetaDataInterface;

  }

  export interface RuleLinkInterface {
    rule: LinkInterface;
  }
  export interface SuppressionRuleInterface {
    id: string;
    displayName: string;
    _links: RuleLinkInterface;
  }
  
  export interface ClashDetectionSRsInterface {
    suppressionRules: SuppressionRuleInterface[];
    _links: NextTokenInterface;
  }

  export interface ClashDetectionTestsInterface {
   tests: ClashDetectionTestInterface[];
   _links: NextTokenInterface;
  }


  export interface ClashDetectionRunLinkInterface {
    run: LinkInterface;
   }
  export interface ClashDetectRunInterface {
    run: string;
    _links: ClashDetectionRunLinkInterface;
  }

  export interface ClashDetectionRunDetailLinkInterface {
    result: LinkInterface;
    test: LinkInterface;
  }
  
  export interface ClashDetectionRunDetailMetaDataInterface {
    id: string;
    displayName: string;
    executedDateTime: string;
    count: string;
    userName: string;
    status: string;
    resultId: string;
    _links: ClashDetectionRunDetailLinkInterface;
  }  

  export interface ClashDetectionRunDetailInterface {
    run: ClashDetectionRunDetailMetaDataInterface;
  }


  export interface ClashDetectionResultDetailInterface {

  }


  export interface ClashDetectionRunInterface {
    id: string;
    displayName: string;
    _links: ClashDetectionRunDetailLinkInterface;
  }
  export interface ClashDetectionRunsInterface{
    runs: ClashDetectionRunInterface[];

  }