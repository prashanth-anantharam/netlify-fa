/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect, useMemo } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { Table } from "@itwin/itwinui-react";
import ClashReviewApi from "./ClashReviewApi";

const ClashReviewTableWidget = () => {
  const iModelConnection = useActiveIModelConnection();
  const [clashData, setClashData] = React.useState<any>();

  useEffect(() => {
    const removeListener = ClashReviewApi.onClashDataChanged.addListener((value: any) => {
      setClashData(value);
    });

    if (iModelConnection) {
      ClashReviewApi.getAndsetClashData(iModelConnection.iTwinId!)
        .catch((error) => {
          console.error(error);
        });
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
          id: "elementALabel",
          Header: "Element A Label",
          accessor: "elementALabel",
        },
        {
          id: "elementBLabel",
          Header: "Element B Label",
          accessor: "elementBLabel",
        },
        {
          id: "elementACategoryIndex",
          Header: "Element A Category",
          accessor: "elementACategoryIndex",
        },
        {
          id: "elementBCategoryIndex",
          Header: "Element B Category",
          accessor: "elementBCategoryIndex",
        },
        {
          id: "clashType",
          Header: "Clash Type",
          accessor: "clashType",
        },
        {
          id: "suppressingRuleIndexArray",
          Header: "Suppressed by rule",
          accessor: "suppressingRuleIndexArray",
        },
      ],
    },
  ], []);

  const data = useMemo(() => {
    const rows: any[] = [];

    if (!clashData || !clashData.result)
      return rows;

    for (const rowData of clashData.result) {
      const row: Record<string, any> = {
        elementAId: rowData.elementAId,
        elementBId: rowData.elementBId,
      };

      columnDefinition[0].columns.forEach((column) => {
        let cellValue: string = "";
        if (column.id === "elementACategoryIndex" || column.id === "elementBCategoryIndex") {
          // Lookup the category name using the index
          cellValue = clashData.categoryList[rowData[column.id]] ? clashData.categoryList[rowData[column.id]].displayName.toString() : "";
        } else if (column.id === "elementAModelIndex" || column.id === "elementBModelIndex") {
          // Lookup the model name using the index
          cellValue = clashData.modelList[rowData[column.id]] ? clashData.modelList[rowData[column.id]].displayName.toString() : "";
        } else if (column.id === "suppressingRuleIndexArray" && clashData.suppressingRuleList) {
          // Lookup the model name using the index
          cellValue = clashData.suppressingRuleList[rowData[column.id]] ? clashData.suppressingRuleList[rowData[column.id]].displayName.toString() : "N\\A";
        }
        else {
          cellValue = rowData[column.id]?rowData[column.id].toString(): "";
        }
        row[column.id] = cellValue;
      });

      rows.push(row);
    }

    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clashData]);

  const onRowClick = useCallback((_, row) => {
    ClashReviewApi.visualizeClash(row.original.elementAId, row.original.elementBId);
  }, []);

  return (
    <Table
      data={data}
      columns={columnDefinition}
      onRowClick={onRowClick}
      isLoading={!clashData}
      emptyTableContent={"No data"}
      density="extra-condensed"
      style={{ height: "100%" }} />
  );
};

export class ClashReviewTableWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ClashReviewTableWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom && _section === StagePanelSection.Start) {
      widgets.push(
        {
          id: "ClashReviewTableWidget",
          label: "Clashes",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <ClashReviewTableWidget />,
        }
      );
    }
    return widgets;
  }
}
