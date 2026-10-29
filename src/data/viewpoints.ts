import * as THREE from 'three';
import { Viewpoint, AnnotationPin } from '../types';
import { BASE_Y, ARCH_RISE, getBridgeY } from '../utils/bridgeMath';

export const VIEWPOINTS: Viewpoint[] = [
  {
    id: 'overview',
    number: 1,
    title: '宇治橋・全構造クリア俯瞰',
    subtitle: '全木造構造・五十鈴川全貌',
    photoRef: '全47枚統合',
    desc: '橋梁周辺の樹木や不要な設置物を排除した全体俯瞰です。全長約101.8m（モデル長92m）の優美な木造反り橋、16基の擬宝珠、両端の神明鳥居とL字型袖高欄、11列の橋脚群とX字筋交い、上流の木除け杭まで一望できます。',
    camPos: new THREE.Vector3(-38, 20, 52),
    camTarget: new THREE.Vector3(0, 4.5, 0),
    pinPos: new THREE.Vector3(0, BASE_Y + ARCH_RISE + 2.2, 0),
    highlights: [
      '全長101.8m・幅8.44mの総檜造り反り橋',
      '中央拱起（反り高さ）2.55mの放物線線形',
      '東西両詰の神明鳥居（高さ約8.85m）',
      '式年遷宮に先立ち20年ごとに架け替えられる神聖な橋'
    ]
  },
  {
    id: 'substructure',
    number: 2,
    title: '下部工：X字筋交い・白塗り貫・切妻小屋根',
    subtitle: 'IMG_8745〜8750 精査',
    photoRef: 'IMG_8745〜8750',
    desc: '11列の橋脚は各4本の太い檜角柱から成り、上下2段の貫（木口が白く保護塗装）の間には橋軸直角方向の強靭な「X字筋交い（ブレース）」が組まれています。冠木の木口を守る切妻小屋根と、根元の緑青銅板袴が特徴です。',
    camPos: new THREE.Vector3(34.5, 2.7, 13.5),
    camTarget: new THREE.Vector3(18.0, 3.1, 0.5),
    pinPos: new THREE.Vector3(24.0, 3.2, 4.2),
    highlights: [
      '4本1組の太い檜角柱（一辺54cm）×11列',
      '橋脚間を堅固に結ぶX字トラス筋交い',
      '冠木両端を雨水から保護する切妻風小屋根カバー',
      '木口腐食を防ぐ伝統的な白塗り保護塗装'
    ]
  },
  {
    id: 'deck_center',
    number: 3,
    title: '橋面：中央縁木・千鳥切石・張り出し敷板',
    subtitle: 'IMG_8752〜8766 精査',
    photoRef: 'IMG_8752〜8766',
    desc: '橋面の中央には右側通行を区分する台形断面の木製「中央縁木」が縦断し、両端は斜めに削ぎ落とされて黒鉄沓金具で留められています。敷板は高欄の外側へ約57cm張り出し、耳桁上に2列の黒釘が打たれています。',
    camPos: new THREE.Vector3(48.2, 6.1, -0.6),
    camTarget: new THREE.Vector3(22.0, 6.2, 0.0),
    pinPos: new THREE.Vector3(38.0, getBridgeY(38.0) + 0.5, 0),
    highlights: [
      '内宮の参拝作法である「右側通行」を導く中央縁木',
      '148枚の檜敷板と生き節・年輪の自然な木肌',
      '耳桁の外側へ約57cm跳ね出した片持ち敷板',
      '雨水を排水するための板間隙間と2列の角釘頭'
    ]
  },
  {
    id: 'railing_joint',
    number: 4,
    title: '高欄詳細：くり形束柱・4本角釘継手・唄金具',
    subtitle: 'IMG_8757〜8758 精査',
    photoRef: 'IMG_8757〜8758',
    desc: '高欄の束柱は首元が優美にくびれた「くり形（斗きょう風）」に削り出され、丸い架木の継手上部には「4本の黒い角釘が突き出た黒鉄プレート」が被さります。平桁中央には突起のあるドーム状の「唄金具」と帯金具が配されます。',
    camPos: new THREE.Vector3(10.3, getBridgeY(10.3) + 1.55, 1.65),
    camTarget: new THREE.Vector3(10.3, getBridgeY(10.3) + 0.95, 3.85),
    pinPos: new THREE.Vector3(10.3, getBridgeY(10.3) + 1.3, 3.65),
    highlights: [
      '首元のくびれと斗（ます）形頭部を持つくり形束柱',
      '架木の継手を堅固に補強する4本角釘の黒鉄プレート',
      '乳首状小突起を中央に備えたドーム型の唄金具（丸鋲）',
      '平桁・地覆を上下に結束する4点鋲留め黒鉄帯金具'
    ]
  },
  {
    id: 'giboshi_closeup',
    number: 5,
    title: '擬宝珠接写：「御裳濯川 御橋」陰刻銘と猪目金具',
    subtitle: 'IMG_8758, 8775, 8776 精査',
    photoRef: 'IMG_8775〜8776',
    desc: '全16基の擬宝珠のなかでも西詰北側（外側左）の擬宝珠には、五十鈴川の古名である「御裳濯川（みもすそがわ）御橋」の陰刻が刻まれています。参拝者に撫でられた下段の赤銅ブロンズ光沢、裾の12個の丸鋲、親柱側面の猪目金具が精巧です。',
    camPos: new THREE.Vector3(-44.4, BASE_Y + 2.15, -2.25),
    camTarget: new THREE.Vector3(-46.0, BASE_Y + 1.95, -3.65),
    pinPos: new THREE.Vector3(-46.0, BASE_Y + 2.1, -3.65),
    highlights: [
      '天正二十年（1592年）の銘を継承する神聖な擬宝珠',
      '「御裳濯川 御橋」の陰刻銘（内宮の守護神・萬寿神札が納められる）',
      '2本1組×3段の凸リング紐と裾周りの12個の青銅丸鋲',
      '親柱側面に打たれた魔除けの猪目（ハート形切り欠き）鉄帯'
    ]
  },
  {
    id: 'kiyokegui',
    number: 6,
    title: '上流側：Aフレーム木除け杭と下流洗い堰',
    subtitle: 'IMG_8761〜8768 精査',
    photoRef: 'IMG_8761〜8768',
    desc: '橋梁の上流側（五十鈴川上流）には、頂部に切妻小屋根を載せた主杭と斜めの前控え杭・水平貫から成る「Aフレーム構造の木除け杭」が7基並び、大雨時の流木から橋脚を防護します。下流側には白波が立つ洗い堰が配されています。',
    camPos: new THREE.Vector3(-4.5, 9.2, 2.2),
    camTarget: new THREE.Vector3(0.0, 1.8, 10.5),
    pinPos: new THREE.Vector3(0, 3.8, 9.2),
    highlights: [
      '本橋から約9m上流に独立設置された流木防護杭（7基）',
      '流木衝突を受け流す斜め前控え杭と白い水切り保護板',
      '主杭頂部を守る切妻笠木小屋根',
      '下流の川幅いっぱいに横一文字の白波を立てる洗い堰（落差工）'
    ]
  },
  {
    id: 'abutment',
    number: 7,
    title: '橋詰：2段亀甲積み橋台・袖高欄・神明鳥居',
    subtitle: 'IMG_8736〜8743 精査',
    photoRef: 'IMG_8736〜8743',
    desc: '両端の橋詰は、多角形の石を精密に噛み合わせた2段の「亀甲積み石垣」で頑強に支えられ、高欄が外側へL字に折れる「袖高欄」と黒鉄縦格子柵が設置されています。床面は千鳥目地の切石から洗い出し、神明鳥居の玉砂利へと連続します。',
    camPos: new THREE.Vector3(58.5, 6.4, 4.2),
    camTarget: new THREE.Vector3(42.0, 5.2, 0.0),
    pinPos: new THREE.Vector3(46.0, BASE_Y + 1.2, 5.5),
    highlights: [
      '自然石を亀甲状に隙間なく組んだ堅牢な石積み橋台',
      '参拝者を迎え入れる外開きL字型の袖高欄（そでこうらん）',
      '貫が柱の外に突き出さない純粋な「伊勢神宮 神明鳥居」様式',
      '千鳥目地御影石切石と玉砂利の見切り縁石'
    ]
  }
];

export const ANNOTATION_PINS: AnnotationPin[] = [
  { id: 'pin-arch', title: '反り橋線形', shortLabel: '反り橋', pos: new THREE.Vector3(0, BASE_Y + ARCH_RISE + 0.6, 0), viewpointId: 'overview' },
  { id: 'pin-pier', title: 'X字筋交い橋脚', shortLabel: '下部工', pos: new THREE.Vector3(16.0, 3.2, 3.8), viewpointId: 'substructure' },
  { id: 'pin-median', title: '中央縁木', shortLabel: '中央縁木', pos: new THREE.Vector3(38.0, getBridgeY(38.0) + 0.3, 0), viewpointId: 'deck_center' },
  { id: 'pin-joint', title: '4本角釘継手', shortLabel: '継手金具', pos: new THREE.Vector3(10.3, getBridgeY(10.3) + 1.45, 3.65), viewpointId: 'railing_joint' },
  { id: 'pin-giboshi', title: '御裳濯川 御橋 擬宝珠', shortLabel: '擬宝珠', pos: new THREE.Vector3(-46.0, BASE_Y + 1.9, -3.65), viewpointId: 'giboshi_closeup' },
  { id: 'pin-kiyoke', title: 'Aフレーム木除け杭', shortLabel: '木除け杭', pos: new THREE.Vector3(0, 3.6, 9.2), viewpointId: 'kiyokegui' },
  { id: 'pin-torii', title: '神明鳥居・袖高欄', shortLabel: '神明鳥居', pos: new THREE.Vector3(52.4, BASE_Y + 4.8, 0), viewpointId: 'abutment' }
];
