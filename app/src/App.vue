<template>
  <v-app>
    <v-main>
      <v-card
          elevation="2"
      >
        <h1>Easy Csv Aggregator<small>(<a href="https://github.com/kjranyone/easy-csv-aggregator"
                                          target="_blank">GitHub</a>)</small></h1>

        <v-tabs
            v-model="searchTab"
            fixed-tabs
            background-color="indigo"
            dark
        >
          <v-tabs-slider color="yellow"></v-tabs-slider>
          <v-tab
              v-for="item in searchItems"
              :key="item"
          >
            {{ item }}
          </v-tab>
        </v-tabs>
        <v-tabs-items v-model="searchTab">
          <v-tab-item
              v-for="item in searchItems"
              :key="item"
          >
            <v-container v-if="item===searchItems[0]">
              <v-row
                  class="text-center"
                  @dragover.prevent
                  @dragenter="onDragEnter"
                  @dragleave="onDragLeave"
                  @drop="onDrop"
              >
                <v-file-input
                    v-model="files"
                    color="deep-purple accent-4"
                    counter
                    label="File input"
                    multiple
                    placeholder="Select your files"
                    prepend-icon="mdi-paperclip"
                    outlined
                    accept=".csv"
                    :show-size="1000"
                    :background-color="isDragging ? 'blue' : 'null'"
                    @change="applyChanges"
                >
                  <template v-slot:selection="{ index, text }">
                    <v-chip v-if="index < 2" color="deep-purple accent-4" dark label small>{{ text }}</v-chip>
                    <span
                        v-else-if="index === 2"
                        class="overline grey--text text--darken-3 mx-2"
                    >+{{ files.length - 2 }} File(s)</span>
                  </template>
                </v-file-input>
              </v-row>
              <template v-if="csvDataList.length >= 2">
                <h3>Select Join Key</h3>
                <v-row>
                  <v-col
                      v-for="(csvData, index) in csvDataList"
                      v-bind:key="index"
                      cols="6"
                      sm="6"
                      md="6"
                  >
                    name: {{ files[index].name }}
                    <v-radio-group
                        v-model="selectedHeaderKey[index]"
                        @change="applyHeaderKeyChanges"
                        column
                    >
                      <v-radio
                          v-for="header in csvDataHeaders[index]"
                          v-bind:key="header"
                          :label="header"
                          color="indigo"
                          :value="header"
                      ></v-radio>
                    </v-radio-group>
                  </v-col>
                </v-row>
              </template>
              <template v-if="readyForAggregate">
                <h3>Options</h3>
                <p class="text-center">
                  <v-checkbox
                      v-model="encodeToSJIS"
                      label="Encode UTF to SJIS"
                  ></v-checkbox>
                </p>
                <p>
                  <v-btn color="primary" @click="aggregate">AGGREGATE AND DOWNLOAD CSV</v-btn>
                </p>
              </template>
            </v-container>
            <template v-else-if="item===searchItems[1]">
              <ul>
                <li>
                  Aggreagte Data From two CSV files.
                </li>
              </ul>
            </template>
          </v-tab-item>
        </v-tabs-items>
      </v-card>
      <v-btn
          v-scroll="onScroll"
          v-show="fab"
          fab
          dark
          fixed
          bottom
          right
          color="primary"
          @click="$vuetify.goTo(0)"
      >
        <v-icon>mdi-chevron-up</v-icon>
      </v-btn>
    </v-main>
  </v-app>
</template>

<script>
require('@/assets/sass/custom.scss');
import Vue from 'vue'
import VuePapaParse from 'vue-papa-parse'
import encoding from 'encoding-japanese';

Vue.use(VuePapaParse)

export default {
  name: 'App',
  components: {},
  data() {
    return {
      fab: false,
      searchTab: null,
      searchItems: [
        'Inport CSV', 'readme',
      ],
      csvDataList: [],
      csvDataHeaders: [],
      selectedHeaderKey: {},
      csvReadCompleted: false,
      readyForAggregate: false,
      encodeToSJIS: false,
      files: [],
      isDragging: false,
      dragCount: 0
    }
  },
  methods: {
    onScroll(e) {
      if (typeof window === 'undefined') return
      const top = window.scrollY || e.target.scrollTop || 0
      this.fab = top > 20
    },
    onDrop(e) {
      e.preventDefault();
      e.stopPropagation();
      this.isDragging = false;
      const _files = e.dataTransfer.files;
      for (const file in _files) {
        if (!isNaN(file)) {
          //filesはファイル以外のデータが入っており、ファイルの場合のみキー名が数字になるため
          this.files.push(_files[file]);
        }
      }
      this.applyChanges();
    },

    onDragEnter(e) {
      e.preventDefault();
      this.isDragging = true;
      this.dragCount++;
    },

    onDragLeave(e) {
      e.preventDefault();
      this.dragCount--;
      if (this.dragCount <= 0) {
        this.isDragging = false;
      }
    },
    applyChanges() {
      console.log("files changed.");
      this.readyForAggregate = false;
      this.csvReadCompleted = false;
      this.csvDataList = [];
      let _this = this;
      let fileCount = this.files.length;
      let completeCount = 0;
      this.files.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          this.$papa.parse(reader.result, {
            header: true,
            complete: function (results) {
              _this.csvDataList.push(results.data);
              if (fileCount <= ++completeCount) {
                _this.readCompleted();
              }
            },
          });
        };
        reader.readAsText(file);
      })
    },
    readCompleted() {
      this.csvReadCompleted = true;
      this.csvDataHeaders = [];
      this.csvDataList.forEach(csvData => {
        this.csvDataHeaders.push(Object.keys(csvData[0]));
      })
    },
    applyHeaderKeyChanges() {
      if (this.csvDataHeaders.length !== Object.keys(this.selectedHeaderKey).length) {
        this.readyForAggregate = false;
        return
      }
      let keysValid = true;
      Object.keys(this.selectedHeaderKey).forEach(key => {
        if (!this.selectedHeaderKey[key]) {
          keysValid = false;
        }
      })
      this.readyForAggregate = keysValid;
    },
    aggregate() {
      let json = this.csvDataList[0];
      json.map(row => {
        let matched = this.csvDataList[1].filter(row2 => {
          console.log('row1 key: ' + row[this.selectedHeaderKey[0]] + ', row2 key: ' + row2[this.selectedHeaderKey[1]])
          return row2[this.selectedHeaderKey[1]] === row[this.selectedHeaderKey[0]]
        })
        if (matched.length === 0) {
          return row;
        } else {
          return Object.assign(row, matched[0]);
        }

      })
      const config = {
        delimiter: ',', // 区切り文字
        header: true, // キーをヘッダーとして扱う
        newline: '\r\n', // 改行
      };

      const delimiterString = this.$papa.unparse(json, config);
      const strArray = encoding.stringToCode(delimiterString);
      const convertedArray = this.encodeToSJIS ? encoding.convert(strArray, 'SJIS', 'UNICODE') :
          encoding.convert(strArray, 'UTF8', 'UNICODE');
      const UintArray = new Uint8Array(convertedArray);
      const blob = new Blob([UintArray], {type: 'text/csv'});
      const aTag = document.createElement('a');

      aTag.download = this.encodeToSJIS ? 'result_sjis.csv' : 'result.csv';

      if (window.navigator.msSaveBlob) {
        // for IE
        window.navigator.msSaveBlob(blob, aTag.download);
      } else if (window.URL && window.URL.createObjectURL) {
        // for Firefox
        aTag.href = window.URL.createObjectURL(blob);
        document.body.appendChild(aTag);
        aTag.click();
        document.body.removeChild(aTag);
      } else if (window.webkitURL && window.webkitURL.createObject) {
        // for Chrome
        aTag.href = (window.URL || window.webkitURL).createObjectURL(blob);
        aTag.click();
      } else {
        // for Safari
        window.open(
            `data:type/csv;base64,${window.Base64.encode(this.state.content)}`,
            '_blank'
        );
      }
    }
  }
};
</script>
