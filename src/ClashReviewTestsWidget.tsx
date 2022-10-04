/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect, useMemo } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { Table, Button } from "@itwin/itwinui-react";
import ClashReviewApi from "./ClashReviewApi";

const ClashReviewTestsWidget = () => {
  const iModelConnection = useActiveIModelConnection();
  const [testsData, setTestsData] = React.useState<any>();
  const [iTwinId, setiTwinId] = React.useState<any>();

  useEffect(() => {
    const removeListener = ClashReviewApi.onTestDataChanged.addListener((value: any) => {
        setTestsData(value);
    });

    if (iModelConnection) {
      ClashReviewApi.getTestsData(iModelConnection.iTwinId!)
        .catch((error) => {
          console.error(error);
        });

      setiTwinId(iModelConnection.iTwinId);
    }
    return () => {
      removeListener();
    };
  }, [iModelConnection]);


  // useEffect(() => {
  //   ClashReviewApi.onTestDataChanged.addListener((value: any) => {
  //       setTestsData(value);
  //   });
  // }, []);


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
          id: "description",
          Header: "Description",
          accessor: "description",
        },
        {
          id: "creationDateTime",
          Header: "Test created on",
          accessor: "creationDateTime",
        },
        {
          id: "modificationDateTime",
          Header: "Test modified on",
          accessor: "modificationDateTime",
        },
      ],
    },
  ], []);

   const data = useMemo(() => {
     const rows: any[] = [];

     if (!testsData )
       return rows;

    console.log(testsData);

    for (const rowData of testsData) {
      const row: Record<string, any> = {};

      columnDefinition[0].columns.forEach((column) => {
        let cellValue: string = "";
        if (column.id === "displayName") 
          cellValue = rowData.displayName ? rowData.displayName.toString() : "";
        else if (column.id === "description") 
          cellValue = rowData.description ? rowData.description.toString() : "";
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
   }, [testsData]);



const runTest = async (itwinId: string ) => {
  const response = await ClashReviewApi.startTestRun();
  console.log(response);
};

const createTest = async () => {
  await ClashReviewApi.createTest();
};

const updateTest = async () => {
  const rowData = testsData[0];
  await ClashReviewApi.updateTest(rowData.id);
};

const refreshTable = async (itwinId: string ) => {
 const tableData = await ClashReviewApi.getUpdatedTestsData(itwinId);
 //setTestsData(tableData);
};

  return (
    <div>
    <div className="button-margin">
    <Button size="small" styleType="high-visibility" onClick={() => createTest()} className="sample-options-button">Create test</Button>
    </div>
    <div className="button-margin">
    <Button size="small" styleType="high-visibility" onClick={() => updateTest()} className="sample-options-button">Update test</Button>
    </div>
    <div className="button-margin">
    <Button size="small" styleType="high-visibility" onClick={() => runTest(iTwinId)} className="sample-options-button">Run test</Button>
    </div>
    <div className="button-margin">
    <Button size="small" styleType="high-visibility" onClick={() => refreshTable(iTwinId)} className="sample-options-button">Refresh table</Button>
    </div>    
    <div className="report-datatable">
    {/* <Button size="small" styleType="high-visibility" onClick={ClashReviewApi.getTestRuns} className="sample-options-button">Get Test Runs</Button> */}
    <Table
      data={data}
      columns={columnDefinition}
    //   onRowClick={onRowClick}
      isLoading={!testsData}
      emptyTableContent={"No data"}
      density="extra-condensed"
      style={{ height: "100%" }} />
      </div>
      </div>
  );
};

export class ClashReviewTestsWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ClashReviewTestsWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right && _section === StagePanelSection.Start) {
      widgets.push(
        {
          id: "ClashReviewTestsWidget",
          label: "Clash Tests",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <ClashReviewTestsWidget />,
        }
      );
    }
    return widgets;
  }
}
