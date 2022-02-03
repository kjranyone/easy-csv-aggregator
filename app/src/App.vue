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
              <v-row justify="center">
                <v-col class="center-input-col" v-for="(item, index) in modeSimple.specificIndexStrings" :key="index">
                  <v-text-field
                      height="40"
                      class="center-input"
                      :background-color="modeSimple.specificIndexStrings[index] ? '#6aaa64' : '#787c7e'"
                      @keydown.enter.prevent="searchSimple"
                      v-model="modeSimple.specificIndexStrings[index]"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-text-field label="位置が確定していない文字" v-model="modeSimple.containString"
                            @keydown.enter.prevent="searchSimple"></v-text-field>
              <v-btn @click="searchSimple">検索</v-btn>
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
    </v-main>
  </v-app>
</template>

<script>
require('@/assets/sass/custom.scss');
import wordsJson from '@/assets/json/words.json'
// import HelloWorld from './components/HelloWorld';

export default {
  name: 'App',

  components: {
    // HelloWorld,
  },

  data() {
    let arr = [];
    let simpleStringNumber = 5;
    arr.length = simpleStringNumber;
    return {
      wordsJson: wordsJson,
      results: [],
      resultMessage: "",
      searchTab: null,
      searchItems: [
        'かんたん検索', '正規表現を使う',
      ],
      modeSimple: {
        stringNumber: simpleStringNumber,
        specificIndexStrings: arr,
        containString: ""
      },
      modeRegex: {
        stringNumber: 0,
        searchString: "て...い",
      }
    }
  },
  methods: {
    simpleStringNumberChanged() {
      console.log("simpleStringNumberChanged");
      let arr = [];
      arr.length = this.modeSimple.stringNumber;
      this.modeSimple.specificIndexStrings = arr;
    },
    searchSimple() {
      console.log("検索開始");
      // (?=...てい)(?=.*っ)(?=.*し)
      // 確定文字
      // specificIndexStrings
      let patternString = "";
      let specificIndexPattern = "";
      for (let i = 0; i < this.modeSimple.specificIndexStrings.length; i++) {
        if (this.modeSimple.specificIndexStrings[i] && this.modeSimple.specificIndexStrings[i].length === 1) {
          specificIndexPattern += this.modeSimple.specificIndexStrings[i];
        } else {
          specificIndexPattern += ".";
        }
      }
      patternString += "(?=" + specificIndexPattern + ")"

      // containString
      for (let i = 0; i < this.modeSimple.containString.length; i++) {
        patternString += "(?=.*" + this.modeSimple.containString[i] + ")"
      }

      let results = []
      let pattern = new RegExp(patternString, "g");
      this.wordsJson.words.forEach(word => {
        if ((parseInt(this.modeSimple.stringNumber) === 0 || word[2].length === parseInt(this.modeSimple.stringNumber)) && pattern.test(word[2])) {
          results.push({
            "word": word[0],
            "common": word[1],
            "kana": word[2]
          })
        }
      })
      this.resultMessage = "検索完了。" + this.wordsJson.words.length + "単語中" + results.length + "単語がマッチしました。";
      this.results = results;
    },
    searchRegex() {
      console.log("検索を行います。環境によっては結果が出るまで遅いかも。キーワード: " + this.modeRegex.searchString);
      let results = []
      let pattern = new RegExp(this.modeRegex.searchString, "g")
      this.wordsJson.words.forEach(word => {
        if ((parseInt(this.modeRegex.stringNumber) === 0 || word[2].length === parseInt(this.modeRegex.stringNumber)) && pattern.test(word[2])) {
          results.push({
            "word": word[0],
            "common": word[1],
            "kana": word[2]
          })
        }
      })
      this.resultMessage = "検索完了。" + this.wordsJson.words.length + "単語中" + results.length + "単語がマッチしました。";
      console.log(this.resultMessage);
      this.results = results;
    }
  }
};
</script>
