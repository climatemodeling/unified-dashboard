LMT Unified DashBoard
=====================

The Land Model Testbed (LMT) unified dashboard, powered by [Tabulator](https://github.com/olifolkerd/tabulator) and the jQuery JS library, illustrates the high-level results from analysis and benchmarking software in the form of data tables (similar to a 2-D heat map). It treats the result as a function of multiple independent (hyperdimensional) inputs and displays the result as a combination of the two inputs.

The main functions of LMT Unified Dashboard include:

- **Be compatible with the CMEC JSON schema:** it can parse JSON files in the CMEC JSON schema and display results.
- **Hide/show columns:** users can hide columns in the table by right-clicking over the column header and choosing "Hide Column" or clicking the column title in the "Hide Columns" drop-down menu on the left side of the page.  After hiding, you can click the column titles in the "Hide Columns" drop-down menu to show the column again or click the cross sign in the menu to make all hidden columns appear immediately.
- **Move columns:** users can move columns in the table horizontally by dragging a column to the desired position. This implementation allows two columns to be compared side by side.
- **Transpose table:** users can transpose the table by reversely selecting the inputs in the X/column and Y/row menus on the left side of the page.
- **Sort rows along the column direction:** Click a column header to switch the three-status sorting of the table rows in the descending, ascending, and original orders based on the row values in the column. It is useful when we want to rank models, metrics, and others.
- **Collapse and expand rows:** the child rows can be collapsed to and expanded from their parent rows. So users can focus on the results at a higher level first and look at the details later.
- **Tooltip:** the cell value/attribute is shown in a  box next to it when users hover a table cell with a mouse.
- **Colorblind colors:** provide colorblind colors.
- **Highlight column groups:** Use the background color on the header to distinguish the columns.
- **Show custom logos:** the logo can be added to the upper right corner of the table.
- **Enable and disable tooltips:** users can toggle the switch in the left side panel to enable and disable tooltips (the cell value is shown when the cursor hovers over the cell)
- **Show/hide cell values:** users can toggle the switch in the left side panel to show and hide cell values.
- **Show/hide bottom titles:** users can toggle the switch in the left side panel to show and hide bottom titles.
- **Show/hide top titles:** users can toggle the switch in the left side panel to show and hide top titles.
- **Enable and disable screen height:** users can toggle the switch in the left side panel to enable and disable screen height (the table height will be limited to 84% of users' screen height when the option is enabled.
- **Scale and normalize cell values in the column and row direction:** users can select the scaling and normalization direction by clicking the checkboxes named row and column in the left side panel.  Users can further select the normalization methods in the drop-down menu below the checkboxes.
- **Show/hide the nested tree icons:** users can show and hide the nested tree icons by right-clicking the top-left cell and selecting the menu item of "Toggle Tree Icon".
- **Hide logo:** users can hide the logo in the top-left cell by right-clicking it and selecting the menu item "Hide Logo".


### Example Sites:
- https://climatemodeling.github.io/unified-dashboard/dist/
- https://lmt.ornl.gov/unified-dashboard
- https://www.ilamb.org/CMIP5v6/ILAMB_AR6/dashboard.html
- https://www.ilamb.org/CMIP5v6/IOMB_AR6/dashboard.htnml
