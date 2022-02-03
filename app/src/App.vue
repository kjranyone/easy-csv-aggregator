<template>
  <v-app>
    <v-main>
      <v-card
          elevation="2"
      >
        <h1>wordleチート（日本語版）<small>(<a href="https://github.com/kjranyone/wordle-ja-cheat"
                                      target="_blank">GitHub</a>)</small></h1>
        <ul>
          <li>
            本サイトは日本語語彙力の強化を目的として頭に浮かばない日本語を部分的なワードから正規表現を用いてリストアップするための教育ツールです。
          </li>
          <li>
            松下達彦(2011)「日本語を読むための語彙データベース（VDRJ） Ver. 1.0 （研究用）」(2022年2月2日) <a
              href="http://www17408ui.sakura.ne.jp/tatsum/index.html" target="_blank">http://www17408ui.sakura.ne.jp/tatsum/index.html</a>
          </li>
          <li>
            上記データベースより3文字以下の語彙を除外したデータを利用しています
          </li>
        </ul>

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
            <template v-if="item==='かんたん検索'">
              <v-text-field
                  type="number" label="文字数" v-model="modeSimple.stringNumber"
                  @input="simpleStringNumberChanged"
                  @keydown.enter.prevent="searchSimple"/>
              <p class="text-center"><small>確定文字</small></p>
              <v-row justify="center">
                <v-col class="center-input-col" v-for="(item, index) in modeSimple.specificIndexStrings" :key="index">
                  <v-text-field
                      height="40"
                      class="center-input"
                      :background-color="item ? '#6aaa64' : '#787c7e'"
                      @keydown.enter.prevent="searchSimple"
                      v-model="modeSimple.specificIndexStrings[index]"
                  ></v-text-field>
                </v-col>
              </v-row>
              <p class="text-center"><small>位置が確定していない文字</small></p>
              <v-row justify="center" v-for="(item, index) in modeSimple.negativeIndexStringsArray" :key="index">
                <v-col class="center-input-col" v-for="(item2, index2) in modeSimple.negativeIndexStringsArray[index]"
                       :key="index2">
                  <v-text-field
                      height="40"
                      class="center-input"
                      :background-color="modeSimple.negativeIndexStringsArray[index][index2] ? '#b59f3b' : '#787c7e'"
                      @keydown.enter.prevent="searchSimple"
                      v-model="modeSimple.negativeIndexStringsArray[index][index2]"
                  ></v-text-field>
                </v-col>
              </v-row>
              <p class="text-center"><small>ハズレの文字</small></p>
              <v-text-field label="含まれない文字列を入力" v-model="modeSimple.negativeString"
                            @keydown.enter.prevent="searchSimple"></v-text-field>
              <p class="text-center">
                <v-btn color="primary" @click="searchSimple">検索</v-btn>
                <v-btn @click="clearSimple">入力をクリア</v-btn>
              </p>
            </template>
            <template v-else-if="item==='正規表現を使う'">
              <v-text-field label="正規表現で検索文字列を入力" v-model="modeRegex.searchString"
                            @keydown.enter.prevent="searchRegex"></v-text-field>
              <v-text-field type="number" label="文字数(0で無視)" v-model="modeRegex.stringNumber"
                            @keydown.enter.prevent="searchRegex"></v-text-field>
              <v-btn @click="searchRegex">検索</v-btn>
            </template>
          </v-tab-item>
        </v-tabs-items>
      </v-card>


      <v-card
          elevation="2"
          id="result-card"
      >
        <h3>検索結果</h3>
        <p v-text="resultMessage"></p>
        <v-simple-table dense>
          <template v-slot:default>
            <thead>
            <tr>
              <th class="text-left">
                語彙
              </th>
              <th class="text-left">
                一般名
              </th>
              <th class="text-left">
                ふりがな
              </th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="item in results"
                :key="item.word"
            >
              <td>{{ item.word }}</td>
              <td>{{ item.common }}</td>
              <td>{{ item.kana }}</td>
            </tr>
            </tbody>
          </template>
        </v-simple-table>
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
import wordsJson from '@/assets/json/words.json';

export default {
  name: 'App',
  components: {},
  data() {
    let arr = [];
    let simpleStringNumber = 5;
    arr.length = simpleStringNumber;
    return {
      wordsJson: wordsJson,
      results: [],
      resultMessage: "",
      fab: false,
      searchTab: null,
      searchItems: [
        'かんたん検索', '正規表現を使う',
      ],
      modeSimple: {
        stringNumber: simpleStringNumber,
        specificIndexStrings: arr,
        negativeIndexStringsArray: [arr.concat(), arr.concat()],
        negativeString: "",
      },
      modeRegex: {
        stringNumber: 0,
        searchString: "て...い",
      }
    }
  },
  methods: {
    simpleStringNumberChanged() {
      let arr = [];
      arr.length = this.modeSimple.stringNumber;
      this.modeSimple.specificIndexStrings = arr;
      this.modeSimple.negativeIndexStringsArray = [arr.concat(), arr.concat()]
    },
    clearSimple() {
      // 入力文字をクリア
      let arr = [];
      arr.length = this.modeSimple.stringNumber;
      this.modeSimple.specificIndexStrings = arr;
      this.modeSimple.negativeIndexStringsArray = [arr.concat(), arr.concat()]
      this.modeSimple.negativeString = "";
    },
    searchSimple() {
      // build regex string
      let patternString = "";
      let specificIndexPattern = "";
      for (let i = 0; i < this.modeSimple.specificIndexStrings.length; i++) {
        specificIndexPattern += this.modeSimple.specificIndexStrings[i] &&
        this.modeSimple.specificIndexStrings[i].length === 1 ? this.modeSimple.specificIndexStrings[i] : ".";
      }
      patternString += "(?=" + specificIndexPattern + ")"

      // negativeIndexStrings
      this.modeSimple.negativeIndexStringsArray.forEach(nIStrings => {
        for (let i = 0; i < nIStrings.length; i++) {
          if (nIStrings[i] && nIStrings[i].length === 1) {
            // その位置には存在しない
            patternString += "(?!" + ".".repeat(i) + nIStrings[i] + ".".repeat(nIStrings.length - (i + 1)) + ")";
            // ただしどこかに存在する
            patternString += "(?=.*" + nIStrings[i] + ")"
          }
        }
      });

      //negativeString
      if (this.modeSimple.negativeString.length > 0) {
        patternString += "(?!.*[" + this.modeSimple.negativeString + "])";
      }

      console.log('patternString: ' + patternString);
      this.execSearch(this.modeSimple.stringNumber, new RegExp(patternString, "g"));
    },
    searchRegex() {
      this.execSearch(this.modeRegex.stringNumber, new RegExp(this.modeRegex.searchString, "g"));
    },
    execSearch(stringNumber, pattern) {
      let results = [];
      this.wordsJson.words.forEach(word => {
        if ((parseInt(stringNumber) === 0 || word[2].length === parseInt(stringNumber)) && pattern.test(word[2])) {
          results.push({
            "word": word[0],
            "common": word[1],
            "kana": word[2]
          })
        }
      })
      this.resultMessage = "検索完了。" + this.wordsJson.words.length + "単語中" + results.length + "単語がマッチしました。";
      this.results = results;
      this.$nextTick(function () {
        document.querySelector('#result-card').scrollIntoView({
          behavior: 'smooth',
          inline: 'nearest',
        });
      })
    },
    onScroll(e) {
      if (typeof window === 'undefined') return
      const top = window.scrollY || e.target.scrollTop || 0
      this.fab = top > 20
    }
  }
};
</script>
