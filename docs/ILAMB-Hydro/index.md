# ILAMB-Hydro: International Land Model Benchmarking for Hydropower Applications

This landing page displays average scores for GCMs and high-resolution downscaled outputs—statistically downscaled (**DBCCA**) and dynamically downscaled and bias-corrected (**RegCM**)—evaluated against two observational datasets: **Daymet** and **Livneh**. Scores are computed following the methodology in Collier et al.

![UD landing page](./figs/ilamb_hydro_ud.png)

*Figure 1. Default landing page showing average scores across models and downscaling methods.*

---

## Controls

A dropdown menu on the left allows users to customize the table by choosing the **X** and **Y** dimensions.

The **X** and **Y** **dimensions**, as well as **Other dimensions** in the dropdown, can be set to **models** (e.g., GCMs or downscaled ensembles), **metrics** (e.g., daily precipitation, maximum/minimum temperature), **regions** (e.g., CONUS or HUC2 regions R01–R18), or **statistics** (e.g., annual mean score, seasonal mean score, overall mean score). Select the primary **X** and **Y** dimensions first; the options available in **Other dimensions** then depend on that choice.

| ![UD settings dimension scaling](./figs/ud_settings_dimension_scaling.png) | ![UD settings option switch](./figs/ud_settings_option_switch.png) |
| --- | --- |

*Figure 2. Controls: (a) dimension scaling; (b) option toggles.*

### Example selection

The following settings produce the plot shown below.

![Settings example](./figs/ud_settings_example01.png)

*Figure 3. Example settings.*

![Example output](./figs/ud_example01.png)

*Figure 4. Resulting plot from the Figure 3 settings.*

---

## Advanced options

The lower portion of the dropdown offers advanced controls, including normalization choices, colormap adjustments, title placement, and whether to display values within each cell.

- **Group Header Title**: filter the table by entering a keyword.
- **Toggle Sort Title**: sort labels alphabetically.
- **Save to Image**: export the displayed image in PNG, JPEG, or PDF.

---

## Detailed results

To view detailed results, select a **reference dataset** under the variable you wish to evaluate.

![Scalar table overview](./figs/Figure5.png)

*Figure 5. Scalar table summarizing metrics for the selected variable across all model and downscaling combinations.*

The scalar table is followed by **annual** and **seasonal** (not shown here) **spatial maps** of various metrics, and **mean time-series** plots for the chosen model–region combinations from the left menu.

![Annual/seasonal maps 1](./figs/Figure6.png)

*Figure 6. Example annual spatial map.*

![Annual/seasonal maps 2](./figs/Figure7.png)

*Figure 7. Additional spatial map (seasonal views available in the app).*

![Mean time series](./figs/Figure8.png)

*Figure 8. Mean time-series plot for selected model–region combinations.*

---

## “All Models (By Plot)”

Selecting **All Models (By Plot)** displays spatial maps of the chosen metric for the observations as well as all GCM and downscaling combinations. Use the menu to choose **All**, **Annual**, or **Seasonal** analyses.

![All models—panel 1](./figs/Figure9.png)

*Figure 9. All-models view, panel 1.*

![All models—panel 2](./figs/Figure10.png)

*Figure 10. All-models view, panel 2.*

![All models—panel 3](./figs/Figure11.png)

*Figure 11. All-models view, panel 3.*

![All models—panel 4](./figs/Figure12.png)

*Figure 12. All-models view, panel 4.*

---

## Regional results (HUC2)

You can also select one of the eighteen 2-digit **HUC** regions to focus the analysis.

![HUC selection](./figs/Figure13.png)

*Figure 13. Regional selection for HUC2.*

### Example: R17 — Pacific Northwest

Selecting **R17—Pacific Northwest** displays the regional scalar table followed by annual and seasonal plots.

![R17 scalar table](./figs/Figure14.png)

*Figure 14. R17 scalar table.*

![R17 results 1](./figs/Figure15.png)

*Figure 15. R17 annual/seasonal results (panel 1).*

![R17 results 2](./figs/Figure16.png)

*Figure 16. R17 annual/seasonal results (panel 2).*

![R17 results 3](./figs/Figure17.png)

*Figure 17. R17 annual/seasonal results (panel 3).*

![R17 results 4](./figs/Figure18.png)

*Figure 18. R17 annual/seasonal results (panel 4).*

---


