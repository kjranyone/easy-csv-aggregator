<template>
  <v-app>
    <v-main>
      <v-card
          elevation="2"
      >
        <h1>wordleチート（日本語版）</h1>
        <ul>
          <li>
            本サイトは日本語語彙力の強化を目的として頭に浮かばない日本語を部分的なワードから正規表現を用いてリストアップするための教育ツールです。
          </li>
          <li>
            松下達彦(2011)「日本語を読むための語彙データベース（VDRJ） Ver. 1.0 （研究用）」(2022年2月2日) <a href="http://www17408ui.sakura.ne.jp/tatsum/index.html" target="_blank">http://www17408ui.sakura.ne.jp/tatsum/index.html</a>
          </li>
          <li>
            上記データベースより3文字以下の語彙を除外したデータを利用しています
          </li>
          <li>
            例: に■■あい -> に..あい
          </li>
          <li>
            例: 「あ」と「い」が含まれる -> [あい].*[あい]
          </li>
          <li>
            GitHubリポジトリは<a href="https://github.com/kjranyone/wordle-ja-cheat" target="_blank">ここ</a>
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
