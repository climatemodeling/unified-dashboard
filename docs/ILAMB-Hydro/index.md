title: ILAMB-Hydro Unified Dashboard


# ILAMB-Hydro: International Land Model Benchmarking for Hydropower Applications


![UD landing page](./figs/ilamb_hydro_ud.png)

This is the landing page for ILAMB-Hydro. By default, it displays the average scores for both GCMs and high-resolution downscaled outputs: statistically downscaled (DBCCA) and dynamically downscaled and bias-corrected (RegCM), evaluated against two observational datasets: Daymet and Livneh. Scores are computed following the methodology outlined in Collier et al. (cite).

| ![UD settings dimension scaling](./figs/ud_settings_dimension_scaling.png) | ![UD settings option switch](./figs/ud_settings_option_switch.png) 
| --- | --- |

A dropdown menu on the left allows users to customize the table by selecting different variables for the X and Y axes.

The X and Y DIMENSIONS, as well as the “Other Dimensions” in the dropdown menu, can be selected as models (e.g., GCMs or downscaled ensembles), metrics (e.g., daily precipitation, maximum temperature, minimum temperature), regions (e.g., CONUS or HUC2 regions R01–R18), or statistics (e.g., annual mean score, seasonal mean score, or overall mean score). The primary X and Y dimensions are selected first, and the options available in the 'OTHER Dimensions' dropdown will then depend on the chosen X and Y axes.

For example, the selection shown below produces the following plot. 

![ud settings example01](./figs/ud_settings_example01.png)
![ud example01](./figs/ud_example01.png)

The lower section of the dropdown menu offers advanced options such as whether and how to normalize values, adjust color mapping, choose title placement, and the display of values within each cell. Additionally, the "Group Header Title" allows to filter the table display by entering a keyword in the box below. The 'Toggle Sort Title' option allows you to sort the labels alphabetically. The “Save to Image” options option allows to download the displayed image in various formats, including PNG, JPEG, and PDF.

To view more detailed results, select a reference dataset under the variable you wish to evaluate.
![Figure5](./figs/Figure5.png)

This will display a scalar table summarizing metrics calculated for the selected variable across all GCM and downscaling method combinations. Following the table, annual and seasonal (not shown here) spatial maps of various metrics and mean time series plots for the model–region combinations chosen from the menu on the left will be presented.
![Figure6](./figs/Figure6.png)
![Figure7](./figs/Figure7.png)
![Figure8](./figs/Figure8.png)
Selecting ‘All Models (By Plot)’ in the menu will display spatial maps of the chosen metric for the observations as well as for all GCM and downscaling method combinations as shown below. The menu can also be used to select the analysis type: ‘All’, ‘Annual’, or ‘Seasonal’.
![Figure9](./figs/Figure9.png)
![Figure10](./figs/Figure10.png)
![Figure11](./figs/Figure11.png)
![Figure12](./figs/Figure12.png)
The menu can also be used to select and display results for one of the eighteen 2-digit Hydrologic Unit Code (HUC) regions.
![Figure13](./figs/Figure13.png)
For example, selecting ‘R17-Pacific Northwest’ displays the scalar table for the region followed by annual and seasonal (not shown here) plots.
![Figure14](./figs/Figure14.png)
![Figure15](./figs/Figure15.png)
![Figure16](./figs/Figure16.png)
![Figure17](./figs/Figure17.png)
![Figure18](./figs/Figure18.png)
