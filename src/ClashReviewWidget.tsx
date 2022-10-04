/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { Button, ToggleSwitch } from "@itwin/itwinui-react";
import ClashReviewApi from "./ClashReviewApi";
import "./index.scss";

const ClashReviewWidget = () => {
  const iModelConnection = useActiveIModelConnection();
  const [applyZoom, setApplyZoom] = React.useState<boolean>(true);
  const [cdTests, setcdTests] = React.useState<any>();
  const [runTest, setrunTest] = React.useState<any>();
  // const [runDetails, setRunDetails] = React.useState<any>();
  // const [resultDetails, setResultDetails] = React.useState<any>();
  // const [runDetails, setRunDetails] = React.useState<any>();
  const [clashData, setClashData] = React.useState<any>();
  


  useEffect(() => {
    /** Create a listener that responds to clashData retrieval */
    const removeListener = ClashReviewApi.onClashDataChanged.addListener((data: any) => {
      setClashData(data);
    });

    if (iModelConnection) {
      /** Will start the clashData retrieval and receive the data through the listener */
      ClashReviewApi.getAndsetClashData(iModelConnection.iTwinId!)
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        });
    }
    return () => {
      removeListener();
    };
  }, [iModelConnection]);

  // /** When the clashData comes in, get the marker data */
  // useEffect(() => {
  //   if (iModelConnection && clashData) {
  //     ClashReviewApi.getClashMarkersData(iModelConnection, clashData).then((mData) => {
  //       setMarkersData(mData);
  //     })
  //       .catch((error) => {
  //         // eslint-disable-next-line no-console
  //         console.error(error);
  //       });
  //   }
  // }, [iModelConnection, clashData]);

  useEffect(() => {
    if (clashData) {
      // Automatically visualize the first clash
      if (clashData !== undefined && clashData.length !== 0 && clashData[0] !== undefined) {
        ClashReviewApi.visualizeClash(clashData[0].elementAId, clashData[0].elementBId);
      }
    }
  }, [clashData]);


  useEffect(() => {
    if (applyZoom) {
      ClashReviewApi.enableZoom();
    } else {
      ClashReviewApi.disableZoom();
    }
  }, [applyZoom]);

  return (
    <>
      <div className="sample-options">
        <div className="iui-alert iui-informational instructions">

        </div>
        <ToggleSwitch checked={applyZoom} onChange={() => setApplyZoom(!applyZoom)} label="Apply Zoom" labelPosition="right" className="sample-options-toggle" />
        <Button size="small" styleType="high-visibility" onClick={ClashReviewApi.resetDisplay} className="sample-options-button">Reset Display</Button>
        </div>
    </>
  );
};

export class ClashReviewWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ClashReviewWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right && _section === StagePanelSection.Start) {
      widgets.push(
        {
          id: "ClashReviewWidget",
          label: "Clash Review Selector",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <ClashReviewWidget />,
        }
      );
    }
    return widgets;
  }
}
