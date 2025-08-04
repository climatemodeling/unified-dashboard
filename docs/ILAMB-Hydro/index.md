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
