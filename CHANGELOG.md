## [1.1.3](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/compare/v1.1.2...v1.1.3) (2021-01-15)


### Bug Fixes

* **extractor:** fixes wrong output on empty input values ([965e684](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/965e68414979ddda7aad2341ba26318bff7be66d)), closes [#23](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/issues/23)
* fixes cli ([713cc62](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/713cc62444111caa112208a880eba1dcac5c7d00))

## [1.1.2](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/compare/v1.1.1...v1.1.2) (2020-10-28)


### Bug Fixes

* fixes uninstaller ([bab1035](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/bab1035adc5ff34a40efdbab3d7c8392af4a0a7d))

## [1.1.1](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/compare/v1.1.0...v1.1.1) (2020-10-27)


### Bug Fixes

* adds uninstaller ([bdca29a](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/bdca29ac2fd472d26c5223dc91ba9373dd0b2b75))

# [1.1.0](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/compare/v1.0.0...v1.1.0) (2020-10-25)


### Bug Fixes

* **installer:** configuration will not be overwritten anymore ([73413a4](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/73413a4c9d8c55604935d7129049768f7be74341))


### Features

* **output:** adds fallback if some required keys are empty ([086b9cd](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/086b9cd328695fb6c229e5d3cfb2d67822c9430a))

# 1.0.0 (2020-10-24)


### Bug Fixes

* **extractor:** fixes failure if section key word is contained elsewhere in the file ([701f402](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/701f40246c2f6b4bc7afb43af0b1e8c06a324623))
* **extractor:** fixes wrong handling of similar keys in restString ([0ae0317](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/0ae031711066dfb0d5859b687d6c71d579da917e))
* fixes build ([64ea8e9](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/64ea8e94efcdc79931ceffd22246d7d388839c60))
* fixes the fallback mode ([7e7f6f9](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/7e7f6f9e1e80ea26cf7dcfa61e521f7c905ca140))
* **config:** fixes config again ([807dc98](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/807dc987835c7c1e26c790501fefe780f6462f84))
* **help:** fixes version in help ([9f32ae0](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/9f32ae0df25a4542efedab5950ec6462d90b7274))
* **installer:** fixes installer ([1cacb5d](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/1cacb5d127e1caf7c6285db30fd9ef009f5159e4))
* **output:** fixes safe string joins (replacing separators) ([56abac0](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/56abac0d80b0f36e3b14cccbfebc4f589bf153b3))
* **runner:** fixes archiving (caused by incomplete async handling) ([cdc7900](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/cdc7900f348d21c4674dd888bd00678e35b71fd2))


### Code Refactoring

* **config:** new better config format ([3972607](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/3972607e1b68c596a0013aff41efd871a93121cb))


### Features

* adds a fallback that writes the raw input text to the output if something fails ([1102cd3](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/1102cd3ae4b82ba7f8199b972243cfc986e1a0bd))
* adds a fallback that writes the raw input text to the output if something fails ([e2653b8](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/e2653b8d1b75b74035ddff84ce94e672e535c8f9))
* adds optional value pre- and suffix ([04698ba](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/04698ba06b30498b2468d15633d18b3ca1323b7b))
* **config:** makes config optional ([1c4bc3e](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/1c4bc3e5085726a11ac104a5b09292935b7fea93))
* **extractor:** now supporting in text keys ([31293e7](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/31293e7f5d791b6915c10c60497c89f230cd3c3b))
* **output:** now supports fixed sets of keys alias keys and similar ([c988640](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/c9886407b81b4db361167fa92bbbe8182fe17688))
* **output:** optionally output rowHeaders ([d0da946](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/d0da946fcec6d58eba4aa086fa3661f71ee22cb2))
* **output:** replace seperator in table output ([71a0479](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/71a0479afbdf14c0d5c612e0391f534484b0d00e))
* **runner:** adds first runner ([8549fb8](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/8549fb8884e662f6c03c15a009bf8c3385eb5098))
* **service:** introduces services ([6ccd7dc](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/6ccd7dc1cd655459f924af0de26e30b6776895c8))
* finishes first iteration MVP :tada: :tada: ([691b9a1](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/691b9a1a5b7f5e6713ad899877cf9b54cb98aea2))


### BREAKING CHANGES

* **output:** now supports a fixed structure and a fixed set of keys. Also it supports merging
multiple input keys. There are multiple ways to output a table. And you can filter the output.
* **config:** changed config stucture and now using yaml as config file type

# [1.0.0-dev.8](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/compare/v1.0.0-dev.7...v1.0.0-dev.8) (2020-10-24)


### Bug Fixes

* **extractor:** fixes failure if section key word is contained elsewhere in the file ([af4adcd](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/af4adcd234277551a53126dcc92cb5a2dbb0da93))
* **extractor:** fixes wrong handling of similar keys in restString ([9e522d7](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/9e522d71e0b9bfffb733d21b1fb6d8a7fa3c094d))
* fixes the fallback mode ([3af4329](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/3af432999da6c87dcb1a3fe196ecf92a61b6449b))

# [1.0.0-dev.7](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/compare/v1.0.0-dev.6...v1.0.0-dev.7) (2020-10-23)


### Features

* adds optional value pre- and suffix ([c67672a](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/c67672aef849d276d9c55300428edd8309cf9bb9))

# [1.0.0-dev.6](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/compare/v1.0.0-dev.5...v1.0.0-dev.6) (2020-10-23)


### Bug Fixes

* fixes build ([dad3558](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/dad3558107a7221a353339847499f2882dd6005b))


### Features

* adds a fallback that writes the raw input text to the output if something fails ([e96e034](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/e96e0340429e6ac7ff8d096d638f3f627fbe7efa))
* adds a fallback that writes the raw input text to the output if something fails ([e2fe586](https://github.com/matzehecht/EinsatzMonitor-Alarm-PDF-Converter/commit/e2fe5865d397eb7a76dbaa9f4c040aa3ceeb32d1))

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
