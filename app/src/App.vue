<template>
  <v-app>
    <v-main>
      <v-card
          elevation="2"
      >
        <h1>wordleチート（日本語版）</h1>
        <ul>
          <li>
            <a href="http://www17408ui.sakura.ne.jp/tatsum/index.html" target="_blank">松下言語学習ラボ</a>の「重要度順語彙データベース (Top
            60894)」から、4文字～7文字の単語に関してリスト化しています。
          </li>
          <li>
            例: に■■あい -> に..あい
          </li>
          <li>
            例: 「あ」と「い」が含まれる -> [あい].*[あい]
          </li>
        </ul>
        <v-text-field label="正規表現で検索文字列を入力" v-model="searchString" @keydown.enter.prevent="search"></v-text-field>
        <v-text-field type="number" label="文字数(0で無視)" v-model="stringNumber" @keydown.enter.prevent="search"></v-text-field>
        <v-btn @click="search">検索</v-btn>
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

  data: () => ({
    "wordsJson": wordsJson,
    "searchString": "て...い",
    "stringNumber": 0,
    "results": [],
    "resultMessage": ""
  }),
  methods: {
    search() {
      console.log("検索を行います。環境によっては結果が出るまで遅いかも。キーワード: " + this.searchString)
      let results = []
      let pattern = new RegExp(this.searchString, "g")
      this.wordsJson.words.forEach(word => {
        if ((parseInt(this.stringNumber) === 0 || word[2].length === parseInt(this.stringNumber)) && pattern.test(word[2])) {
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
