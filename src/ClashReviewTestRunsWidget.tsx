/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect, useMemo } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { Table, Button } from "@itwin/itwinui-react";
import ClashReviewApi from "./ClashReviewApi";

const ClashReviewTestRunsWidget = () => {
  const iModelConnection = useActiveIModelConnection();
  const [testRunsData, setTestRunsData] = React.useState<any>();
  const [iTwinId, setiTwinId] = React.useState<any>();

  useEffect(() => {
    const removeListener = ClashReviewApi.onTestRunDataChanged.addListener((value: any) => {
        setTestRunsData(value);
    });

    if (iModelConnection) {
      ClashReviewApi.getTestRunsData(iModelConnection.iTwinId!)
        .catch((error) => {
          console.error(error);
        });

        setiTwinId (iModelConnection.iTwinId);
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
          Header: "Test Name",
          accessor: "displayName",
        },
        {
          id: "executedDateTime",
          Header: "Test execution time",
          accessor: "executedDateTime",
        },
        {
          id: "count",
          Header: "Number of clashes",
          accessor: "count",
        },
        {
          id: "userName",
          Header: "Test run by",
          accessor: "userName",
        },
        {
          id: "status",
          Header: "Status",
          accessor: "status",
        },
      ],
    },
  ], []);

   const data = useMemo(() => {
     const rows: any[] = [];

     if (!testRunsData )
       return rows;

    console.log(testRunsData);

    for (const rowData of testRunsData) {
      const row: Record<string, any> = {};

      columnDefinition[0].columns.forEach((column) => {
        let cellValue: string = "";
        if (column.id === "displayName") 
          cellValue = rowData.displayName ? rowData.displayName.toString() : "";
        else if (column.id === "count") 
          cellValue = rowData.count ? rowData.count.toString() : "";
        else if (column.id === "userName") 
          cellValue = rowData.userName ? rowData.userName.toString() : "";
        else if (column.id === "status") 
          cellValue = rowData.status ? rowData.status.toString() : "";
        else if (column.id === "executedDateTime") 
          cellValue = rowData.executedDateTime ? rowData.executedDateTime.toString() : "";
        else if (column.id === "resultId") 
          cellValue = rowData.resultId ? rowData.resultId.toString() : "";
        else
            cellValue = "";

        row[column.id] = cellValue;
      });

      rows.push(row);
    }

     return rows;
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [testRunsData]);

   const onRowClick = useCallback((_, row) => {
     ClashReviewApi.updateClashResultsTable(row.index);
   }, []);
  

  return (
    <div className="report-datatable">
    {/* <Button size="small" styleType="high-visibility" onClick={ClashReviewApi.getTestRuns} className="sample-options-button">Get Test Runs</Button> */}
    <Table
      data={data}
      columns={columnDefinition}
      onRowClick={onRowClick}
      isLoading={!testRunsData}
      emptyTableContent={"No data"}
      density="extra-condensed"
      style={{ height: "100%" }} />
      </div>
     
  );
};


export class ClashReviewTestRunsWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ClashReviewTestRunsWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right && _section === StagePanelSection.Start) {
      widgets.push(
        {
          id: "ClashReviewTestRunsWidget",
          label: "Clash Test Runs",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <ClashReviewTestRunsWidget />,
        }
      );
    }
    return widgets;
  }
}
