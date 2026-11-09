/**
 * Authoritative bundled sample datasets for guided projects.
 * Matches backend/datasets/samples/ for deterministic, real model training.
 */

export const CHURN_SAMPLE_CSV = `age,tenure_months,monthly_charges,contract_type,support_calls,churn
56,45,85.54,Month-to-month,3,Yes
69,65,53.1,One year,1,No
46,71,76.91,Two year,2,No
32,9,77.02,Month-to-month,3,No
60,1,68.22,One year,0,Yes
25,8,28.13,Two year,0,No
38,63,95.18,One year,4,Yes
56,11,48.87,One year,2,No
36,8,36.79,One year,2,No
40,35,23.67,Month-to-month,4,Yes
28,35,73.18,Month-to-month,3,Yes
28,33,80.98,Two year,2,No
41,5,21.49,Two year,0,No
53,41,66.09,Two year,0,No
57,28,40.38,Two year,1,Yes
41,7,78.07,One year,2,Yes
20,12,35.69,One year,3,No
39,34,82.18,One year,4,Yes
19,33,54.81,One year,4,Yes
41,48,104.31,One year,3,Yes
61,23,32.38,One year,5,Yes
47,62,50.7,Two year,1,No
55,37,30.21,Month-to-month,4,Yes
19,44,103.22,Month-to-month,2,Yes
38,35,98.96,Month-to-month,1,No
50,65,43.21,One year,2,No
29,47,79.4,Month-to-month,0,Yes
39,3,93.55,Month-to-month,1,Yes
61,1,69.97,One year,4,Yes
42,5,67.67,Month-to-month,1,Yes
66,14,41.77,One year,1,No
44,27,28.38,Month-to-month,1,Yes
59,9,100.75,Month-to-month,5,Yes
45,15,101.04,Two year,1,Yes
33,42,76.98,Month-to-month,2,Yes
32,51,50.51,Month-to-month,0,Yes
64,63,51.43,One year,3,Yes
68,52,85.34,One year,1,No
61,4,100.74,Month-to-month,4,Yes
69,23,99.84,One year,1,No
20,15,90.19,Month-to-month,4,Yes
54,43,77.78,Month-to-month,2,Yes
68,29,27.57,One year,4,Yes
24,36,34.55,One year,3,Yes
38,13,100.87,One year,0,No
26,32,74.58,One year,4,Yes
56,71,20.83,Two year,4,Yes
35,59,29.13,One year,0,No
21,28,79.72,Month-to-month,3,Yes
42,66,20.46,One year,1,No
31,42,34.47,Month-to-month,4,Yes
67,45,69.39,Month-to-month,0,Yes
26,62,82.27,Month-to-month,2,Yes
43,57,78.68,Month-to-month,0,No
19,6,40.18,Two year,2,No
37,28,84.1,Two year,3,Yes
45,28,41.35,One year,1,No
64,44,49.29,Month-to-month,0,Yes
24,30,87.18,Month-to-month,5,Yes
61,62,78.47,Month-to-month,4,Yes
25,62,96.43,Month-to-month,3,Yes
64,1,79.19,One year,0,No
52,27,71.15,One year,4,Yes
31,62,28.43,One year,0,No
34,3,53.09,Month-to-month,2,No
53,70,43.87,Two year,0,No
67,27,41.96,One year,5,No
57,9,107.57,One year,0,Yes
21,62,55.38,One year,0,No
19,37,100.28,Month-to-month,5,Yes
23,51,76.8,Month-to-month,3,Yes
59,44,91.53,Month-to-month,0,Yes
21,24,65.24,One year,5,Yes
46,59,71.92,Month-to-month,4,Yes
35,32,64.33,Month-to-month,2,Yes
43,52,37.57,Month-to-month,2,Yes
61,62,85.02,Month-to-month,0,Yes
51,58,45.27,Two year,3,Yes
27,52,22.19,One year,3,Yes
53,12,78.09,Month-to-month,4,Yes
31,39,35.94,Month-to-month,0,Yes
48,2,104.64,Month-to-month,2,Yes
65,3,105.85,Month-to-month,3,Yes
32,56,102.34,Month-to-month,0,Yes
25,59,53.31,Month-to-month,3,Yes
31,2,21.39,Month-to-month,5,Yes
40,2,103.55,One year,3,No
57,54,58.54,One year,2,Yes
38,1,107.0,Month-to-month,1,Yes
33,19,106.73,Month-to-month,4,Yes
62,2,96.77,One year,4,Yes
35,53,46.5,One year,2,No
64,44,54.66,Two year,3,Yes
41,32,96.6,One year,0,Yes
43,70,48.52,Month-to-month,3,Yes
42,32,35.25,Month-to-month,2,No
62,68,70.11,One year,4,Yes
58,55,104.25,Month-to-month,3,No
46,56,82.64,One year,4,Yes
32,17,71.31,Two year,0,No`;

export const HOUSING_SAMPLE_CSV = `square_feet,bedrooms,bathrooms,location_grade,price
1840,1,3,Suburban,397166.67
3474,3,2,Suburban,713722.11
3442,3,2,Rural,618248.4
1288,3,3,Urban,458280.28
2084,5,3,Suburban,545328.94
2233,2,2,Suburban,481578.12
2752,5,2,Urban,848439.27
1110,2,1,Suburban,262634.59
984,3,2,Rural,217091.07
1004,3,2,Urban,363233.12
3470,5,3,Suburban,794108.7
1117,5,2,Suburban,347908.63
1075,2,1,Rural,196107.31
2600,4,2,Urban,778996.45
3356,2,3,Suburban,695255.34
2268,5,3,Suburban,600799.89
2493,5,2,Urban,745097.45
3418,1,3,Urban,907184.6
2060,5,1,Rural,427331.28
3324,1,1,Suburban,607219.15
1313,4,2,Rural,287931.69
682,2,2,Suburban,197188.39
1768,2,2,Rural,297479.32
3104,1,3,Suburban,617052.75
2501,2,1,Urban,653075.36
2648,5,1,Urban,827916.06
650,3,3,Suburban,251035.18
1284,1,1,Urban,371529.33
1316,2,2,Rural,264329.08
2069,1,2,Urban,538710.22
1048,1,2,Rural,187044.2
1480,3,1,Suburban,363740.62
1087,5,2,Urban,437526.08
2423,1,3,Rural,415606.98
2681,2,3,Rural,458459.12
2742,4,1,Suburban,602937.69
2174,1,3,Suburban,471984.4
2801,1,3,Suburban,580843.95
849,3,1,Suburban,237405.51
1273,5,2,Suburban,401529.95
1037,4,2,Suburban,300444.05
2765,2,2,Suburban,586939.03
1370,4,1,Rural,298176.52
867,2,3,Urban,321734.8
2584,5,2,Suburban,625012.0
1677,2,2,Suburban,363093.3
835,3,1,Suburban,254160.41
988,3,2,Urban,364918.47
1362,3,1,Rural,260287.15
2448,3,3,Suburban,576375.14
3048,4,1,Suburban,653074.84
1223,5,1,Suburban,339013.08
3414,2,1,Rural,520266.56
1852,2,1,Urban,526958.15
1177,3,3,Urban,412211.56
2722,3,3,Suburban,636281.91
1034,1,2,Suburban,209891.06
2750,5,3,Urban,889946.85
1363,4,3,Suburban,393505.26
3385,2,2,Rural,549989.3
3453,1,3,Suburban,683366.21
1929,1,1,Suburban,393207.04
2745,2,1,Suburban,558535.48
3445,4,2,Suburban,766649.53
1958,1,2,Urban,531385.41
3082,1,2,Urban,794942.53
1046,5,1,Suburban,322825.82
2617,4,3,Rural,491993.82
1931,1,1,Urban,508471.03
848,4,2,Urban,341779.47
765,2,3,Rural,165937.22
1958,3,3,Urban,625320.96
1619,1,1,Urban,433408.98
1141,5,2,Suburban,357620.25
1358,2,1,Suburban,309716.51
2728,4,3,Suburban,641253.73
2780,2,1,Rural,444223.6
1396,1,1,Suburban,279605.43
737,4,2,Urban,344395.68
2831,3,2,Rural,476988.41
1953,2,3,Suburban,452663.79
3432,1,1,Suburban,632221.25
2475,5,1,Suburban,600937.33
668,4,1,Urban,312900.96
3193,2,3,Suburban,673580.45
2700,2,3,Suburban,595740.36
2073,3,2,Suburban,503122.12
804,3,2,Suburban,264935.55
2773,5,2,Rural,495698.89
642,5,1,Suburban,236366.35
2506,1,1,Rural,383491.72
2758,1,2,Rural,441543.37
1360,5,1,Suburban,392564.89
3495,5,2,Suburban,773213.84
2742,4,3,Urban,832929.5
2594,3,2,Suburban,560589.26
2535,1,3,Suburban,517127.23
1499,3,1,Suburban,338720.08
959,3,2,Rural,208247.5
2319,5,1,Suburban,537144.73`;

export function createSampleDatasetFile(filename: string, csvContent: string): File {
  const blob = new Blob([csvContent], { type: 'text/csv' });
  return new File([blob], filename, { type: 'text/csv' });
}
