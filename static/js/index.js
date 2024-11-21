$(async () => {
    // 定義更新間隔選項
    const fetchIntervalItems = [
        {
            text: "15秒",
            value: 15,
        },
        {
            text: "30秒",
            value: 30,
        },
        {
            text: "1分",
            value: 60,
        },
    ];

    function setCellTemplate(element, options) {
        // 設定單元格模板，顯示角色名稱和圖片
        const displayText = roleConfig[options.value].displayText; // 取得顯示文字
        element.text(displayText); // 設定單元格文字

        const imagePath = roleConfig[options.value].imagePath; // 取得圖片路徑
        const $image = $("<img>", {
            src: `${imagePath}`, // 設定圖片來源
            alt: `${displayText}`, // 設定圖片替代文字
            style: "width: 20px; height: 20px; margin-right: 10px", // 設定圖片樣式
        });
        element
            .prepend($image) // 在單元格前面添加圖片
            .css("display", "flex") // 設定顯示為彈性盒子
            .css("align-items", "center"); // 垂直置中對齊
    }

    // 獲取網格容器的摘要資訊
    function getGridContainerSummary(chattersCount) {
        return {
            groupItems: [
                {
                    column: "role", // 角色欄位
                    summaryType: "count", // 計算類型為計數
                },
            ],
            totalItems: [
                {
                    name: "ChattersCount", // 總計名稱
                    showInColumn: "name", // 顯示在名稱欄位
                    displayFormat: "聊天室人數: {0}", // 顯示格式
                    summaryType: "custom", // 自定義計算類型
                },
            ],
            // 自定義摘要計算
            calculateCustomSummary: (options) => {
                options.totalValue = chattersCount; // 設定總計值為聊天室人數
            },
        };
    }

    // 異步函數：獲取資料來源
    async function fetchDataSource() {
        let fetchedDataSource;

        // 發送請求以獲取聊天室資料
        await fetch(`/api/chatters/${channel}`)
            .then((response) => response.json()) // 將回應轉換為 JSON 格式
            .then((data) => {
                fetchedDataSource = data; // 儲存獲取的資料
            })
            .catch((error) => {
                console.error("獲取資料時發生錯誤:", error); // 錯誤處理
            });

        return fetchedDataSource; // 返回獲取的資料
    }

    // 異步函數：更新資料網格
    async function updateDataGrid() {
        let fetchedDataSource = await fetchDataSource(); // 獲取資料來源

        gridContainer.option("dataSource", fetchedDataSource.chatters); // 更新網格資料來源
        gridContainer.option(
            "summary",
            getGridContainerSummary(fetchedDataSource.count) // 更新摘要資訊
        );
    }

    // 更新獲取間隔的函數
    function updateFetchInterval() {
        clearInterval(fetchIntervalId); // 清除現有的計時器
        fetchInterval =
            $("#fetchInterval").dxSelectBox("option", "value") * 1000; // 獲取新的間隔時間（毫秒）
        fetchIntervalId = setInterval(updateDataGrid, fetchInterval); // 設定新的計時器

        updateDataGrid(); // 立即更新資料網格
    }

    // 獲取初始資料來源
    const dataSource = await fetchDataSource();

    // 初始化資料網格
    const gridContainer = $("#gridContainer")
        .dxDataGrid({
            dataSource: dataSource.chatters, // 設定資料來源
            allowColumnReordering: true, // 允許重新排序欄位
            width: "100%", // 設定寬度為 100%
            height: "100%",
            showBorders: true, // 顯示邊框
            hoverStateEnabled: true, // 啟用懸停狀態
            grouping: {
                autoExpandAll: true, // 自動展開所有分組
                expandMode: "rowClick", // 點擊行展開
            },
            searchPanel: {
                visible: true, // 顯示搜尋面板
            },
            paging: {
                enabled: false,
            },
            groupPanel: {
                visible: true, // 顯示分組面板
            },
            selection: {
                mode: "single", // 單選模式
            },
            columns: [
                {
                    dataField: "role", // 角色欄位
                    caption: "角色", // 欄位標題
                    groupIndex: 0, // 設定為第一個分組欄位
                    groupCellTemplate: (element, options) =>
                        setCellTemplate(element, options), // 自定義分組單元格模板
                    cellTemplate: (element, options) =>
                        setCellTemplate(element, options), // 自定義單元格模板
                },
                {
                    dataField: "name", // 名稱欄位
                    caption: "名稱", // 欄位標題
                    allowGrouping: false, // 不允許分組
                    cellTemplate(container, options) {
                        // 自定義單元格模板，生成超連結
                        return $("<a>", {
                            href: `https://www.twitch.tv/${options.value}`,
                            target: "_blank", // 在新標籤頁中打開
                        }).text(options.value);
                    },
                },
            ],
            sortByGroupSummaryInfo: [
                {
                    summaryItem: "count",
                },
            ], // 根據分組摘要資訊排序
            summary: getGridContainerSummary(dataSource.count),
            toolbar: {
                items: [
                    {
                        location: "before",
                        widget: "dxSwitch", // 使用 DevExtreme 開關
                        options: {
                            value: false,
                            onValueChanged(data) {
                                $("#fetchInterval").dxSelectBox(
                                    "option",
                                    "disabled",
                                    !data.value
                                );

                                if (data.value) {
                                    updateFetchInterval();
                                } else {
                                    clearInterval(fetchIntervalId);
                                }
                            },
                        },
                    },
                    {
                        location: "before",
                        widget: "dxSelectBox", // 使用 DevExtreme 下拉式選單
                        options: {
                            items: fetchIntervalItems,
                            value: fetchIntervalItems[0].value,
                            displayExpr: "text",
                            valueExpr: "value",
                            elementAttr: {
                                id: "fetchInterval",
                            },
                            placeholder: "更新間隔時間",
                            onValueChanged(data) {
                                updateFetchInterval();
                            },
                        },
                    },
                    {
                        name: "groupPanel",
                        location: "after",
                    },
                    "searchPanel", // 顯示搜尋面板
                    {
                        location: "after", // 在其他項目之後顯示
                        widget: "dxButton", // 使用 DevExtreme 按鈕
                        options: {
                            icon: "refresh", // 刷新圖示
                            onClick() {
                                updateDataGrid(); // 點擊時重新獲取資料
                            },
                        },
                    },
                ],
            },
        })
        .dxDataGrid("instance"); // 獲取資料網格實例

    // 初始化獲取間隔及計時器變數
    let fetchInterval, fetchIntervalId;
});
