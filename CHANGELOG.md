# [1.0.0-dev.3](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/compare/v1.0.0-dev.2...v1.0.0-dev.3) (2020-09-13)


### Code Refactoring

* **config:** new better config format ([f957a21](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/f957a216e7bcf3338b287458684b927a9cf147bc))


### Features

* **extractor:** now supporting in text keys ([623a60c](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/623a60caae58fd5be373e4a18a2ffad90419ea6a))
* **output:** now supports fixed sets of keys alias keys and similar ([411b59d](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/411b59d579e85581605f77b844ace93ef9786e83))


### BREAKING CHANGES

* **output:** now supports a fixed structure and a fixed set of keys. Also it supports merging
multiple input keys. There are multiple ways to output a table. And you can filter the output.
* **config:** changed config stucture and now using yaml as config file type

# [1.0.0-dev.2](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/compare/v1.0.0-dev.1...v1.0.0-dev.2) (2020-09-11)


### Bug Fixes

* **output:** fixes safe string joins (replacing separators) ([9a321a5](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/9a321a5ace3aa5df0a38d3399be7fa628c65e1bb))


### Features

* **output:** optionally output rowHeaders ([215dbb9](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/215dbb950563a6bbf64a045ee2c85c5e974ee89d))

# 1.0.0-dev.1 (2020-09-09)


### Bug Fixes

* **help:** fixes version in help ([bff8821](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/bff8821232d440bcdb03f24370657d0ffb253217))


### Features

* **config:** makes config optional ([537d382](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/537d3822e29f043ce427d768894125d92241eb01))
* **output:** replace separator in table output ([f7afa11](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/f7afa11536e8b7efecf0264f0a8eabb44bab2081))
* finishes first iteration MVP :tada: :tada: ([3e67b90](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/3e67b9078e02ddc79bbaa72acef4954c2374612d))
