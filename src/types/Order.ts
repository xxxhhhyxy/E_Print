export interface IOrder {
  // 必填字段
  order_id?: string //订单号
  order_ver?: string //订单版本
  customer: string // 客户名称: 创建草稿时唯一需要明确的，这样就可以开始保存草稿了

  // 外销与CPSIA
  cpcQueRen?: boolean //cpc确认
  waixiaoFlag?: boolean //是否外销
  cpsiaYaoqiu?: boolean //cpsia要求
  dingZhiBeiZhu?: string //订纸备注

  // 产品基本信息,分类及安全要求
  productName?: string //成品名称
  jiuBianMa?: string //旧编码
  isbn?: string //ISBN
  customerPO?: string //客户PO？
  baoJiaDanHao?: string //报价单号
  xiLieDanMing?: string //系列单名
  qiTaShiBie?: string //其他识别
  chanPinDaLei?: string //产品大类
  ziLeiXing?: string //子类型
  fscType?: string //FSC类型
  fenBanShuoMing?: string //分版说明
  baoLiuQianSe?: string //是否要保留签色

  // 订单数量及产品规格
  dingDanShuLiang?: number //订单数量
  chuYangShuLiang?: number //出样数量
  chaoBiLiShuLiang?: number //超比例数量
  teShuLiuYangZhang?: number //特殊留样张
  beiPinShuLiang?: number //备品数量
  teShuLiuShuYang?: number //特殊留书样
  zongShuLiang?: number //总数量
  chuYangShuoMing?: number //出样说明
  zhuangDingFangShi?: string //装订方式
  guigeGaoMm?: number //规格：高
  guigeKuanMm?: number //规格:宽
  guigeHouMm?: number //规格：厚
  genSeZhiShi?: string //跟色指示

  // 排期信息和其他
  xiaZiliaodaiRiqiRequired?: Date //下资料袋要求
  xiaZiliaodaiRiqiPromise?: Date //下资料袋承诺
  yinzhangRiqiRequired?: Date //印章日期要求
  yinzhangRiqiPromise?: Date //印章日期承诺
  zhepaiRiqiRequired?: Date //折牌日期要求
  zhepaiRiqiPromise?: Date //折牌日期承诺
  chuyangRiqiRequired?: Date //出样日期要求
  chuyangRiqiPromise?: Date //出样日期承诺
  chuHuoShuLiang?: number //出货数量
  chuHuoRiqiRequired?: Date //出货日期要求
  chuHuoRiqiPromise?: Date //出货日期承诺
  yongTu?: string //用途
  keLaiXinxi?: string //客来信息

  //产品明细
  chanPinMingXi?: IProduct[] //产品明细
  fuLiaoShuoMing?: string //辅料说明
  chanPinMingXiTeBieShuoMing?: string //产品明细特别说明
  fenBanShuoMing2?: string //分版说明
  wuLiaoShuoMing?: string //物料说明
  yinShuaGenSeYaoQiu?: string //印刷和跟色要求
  zhuangDingShouGongYaoQiu?: string //装订/手工
  qiTa?: string //其他
  zhiLiangYaoQiu?: string //质量要求
  keHuFanKui?: string //客户反馈
  teShuYaoQiu?: string //特殊要求
  kongZhiFangFa?: string //控制方法
  dingDanTeBieShuoMing?: string //订单特别说明
  yangPinPingShenXinXi?: string //样品评审信息
  dingDanPingShenXinXi?: string //订单评审信息

  yeWuDaiBiaoFenJi?: string //业务代表/分机
  yeWuRiqi?: Date //业务日期
  shenHeRen?: string //审核人
  shenHeRiqi?: Date //审核日期
  daYinRen?: string //打印人
  daYinRiqi?: Date //打印日期

  //表格上没有的
  orderstatus: OrderStatus //订单状态
  auditLogs?: IAuditLog[] // 审批日志：记录“单子是怎么过的” (用于查看审核记录), OrderState不是Audit的时候不再更新
  attachments?: IAttachment[] //创建订单时杀那个穿的附件
}

//审核记录
export interface IAuditLog {
  time: string
  operator: string //业务员或者审核人，后期以工号替代
  action: string
  comment: string
}

// ============ 订单状态枚举 ============
export enum OrderStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_PRODUCTION = 'IN_PRODUCTION',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/** 附件条目接口 */
export interface IAttachment {
  category: string // 附件分类
  fileName: string // 文件名
  file?: File // 可选：用于本地上传阶段的 File 对象
  url?: string // 可选：用于查看阶段的服务器下载链接
}

export interface IProduct {
  neiWen?: string //内文
  yongZhiChiCun?: string //报价用纸尺寸
  houDu?: number //厚度
  keZhong?: number //克重
  chanDi?: string //产地
  pinPai?: string //品牌
  zhiLei?: string //纸类
  FSC?: string //fsc
  yeShu?: number //页数
  yinSe?: string //印色(正/反)
  zhuanSe?: string //专色(正/反)
  biaoMianChuLi?: string //表面处理
  zhuangDingGongYi?: string //装订工艺
  beiZhu?: string //备注
}
