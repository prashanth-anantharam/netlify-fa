/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect, useMemo } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { Table, Button } from "@itwin/itwinui-react";
import ClashReviewApi from "./ClashReviewApi";

const ClashReviewSRsWidget = () => {
  const iModelConnection = useActiveIModelConnection();
  const [SRsData, setSRsData] = React.useState<any>();
  const [iTwinId, setiTwinId] = React.useState<any>();

  useEffect(() => {
    const removeListener = ClashReviewApi.onSRsDataChanged.addListener((value: any) => {
        setSRsData(value);
    });

    if (iModelConnection) {
      ClashReviewApi.getSRsData(iModelConnection.iTwinId!)
        .catch((error) => {
          console.error(error);
        });

      setiTwinId(iModelConnection.iTwinId);
    }
    return () => {
      removeListener();
    };
  }, [iModelConnection]);

  const columnDefinition = useMemo(() => [
    {
      Header: "Table",
      columns: [
        {
          id: "displayName",
          Header: "Suppression rule",
          accessor: "displayName",
        },
        {
          id: "reason",
          Header: "Description",
          accessor: "reason",
        },
        {
          
          id: "creationDateTime",
          Header: "Date Created",
          accessor: "creationDateTime",
        },
        {
          id: "modificationDateTime",
          Header: "Date Modified",
          accessor: "modificationDateTime",
        }
      ],
    },
  ], []);

   const data = useMemo(() => {
     const rows: any[] = [];

     if (!SRsData )
       return rows;

    console.log(SRsData);

    for (const rowData of SRsData) {
      const row: Record<string, any> = {};

      columnDefinition[0].columns.forEach((column) => {
        let cellValue: string = "";
        if (column.id === "displayName") 
          cellValue = rowData.displayName ? rowData.displayName.toString() : "";
        else if (column.id === "reason") 
          cellValue = rowData.reason ? rowData.reason.toString() : "";
        else if (column.id === "creationDateTime") 
          cellValue = rowData.creationDateTime ? rowData.creationDateTime.toString() : "";
        else if (column.id === "modificationDateTime") 
          cellValue = rowData.modificationDateTime ? rowData.modificationDateTime.toString() : "";

        else 
            cellValue = "";

        row[column.id] = cellValue;
      });

      rows.push(row);
    }

     return rows;
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [SRsData]);

//   const onRowClick = useCallback((_, row) => {
//     ClashReviewApi.visualizeClash(row.original.elementAId, row.original.elementBId);
//   }, []);

  const createSR = async (itwinId: string ) => {
    const response = await ClashReviewApi.startTestRun();
    console.log(response);
  };


  return (
    <div>
    <div className="button-margin">
    <Button size="small" styleType="high-visibility" onClick={() => createSR(iTwinId)} className="sample-options-button">Create Suppression Rule</Button>
    </div>
    <div className="report-datatable">
    {/* <Button size="small" styleType="high-visibility" onClick={ClashReviewApi.getTestRuns} className="sample-options-button">Get Test Runs</Button> */}
    <Table
      data={data}
      columns={columnDefinition}
    //   onRowClick={onRowClick}
      isLoading={!SRsData}
      emptyTableContent={"No data"}
      density="extra-condensed"
      style={{ height: "100%" }} />
      </div>
      </div>
  );
};

export class ClashReviewSRsWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ClashReviewSRsWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right && _section === StagePanelSection.Start) {
      widgets.push(
        {
          id: "ClashReviewSRsWidget",
          label: "Suppression Rules",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <ClashReviewSRsWidget />,
        }
      );
    }
    return widgets;
  }
}
