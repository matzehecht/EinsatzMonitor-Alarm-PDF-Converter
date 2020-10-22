# [1.0.0-dev.5](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/compare/v1.0.0-dev.4...v1.0.0-dev.5) (2020-10-22)


### Bug Fixes

* **installer:** fixes installer ([2a2c833](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/2a2c83367cfac7b8183c4b69dccc1fc8e9a5a9a7))
* **runner:** fixes archiving (caused by incomplete async handling) ([ccacf7b](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/ccacf7b7a8b68d29bcc9a8418fc5cc259fe7370b))

# [1.0.0-dev.4](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/compare/v1.0.0-dev.3...v1.0.0-dev.4) (2020-10-22)


### Bug Fixes

* **config:** fixes config again ([961d50e](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/961d50e2dda520e04fb6daf71f70e16d5dc9b4ea))


### Features

* **runner:** adds first runner ([a305d14](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/a305d141397dbb2b9347dedb7a5a4e6727d86a6a))
* **service:** introduces services ([fa049ae](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/fa049ae4e7ba3aab45b4ec912b0f6e3b193d349e))

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
