/**
 * 集团碳账本内核桥接：挂接冀东数据包、企业检索 UI、能力模块、报告企业名
 * 报告文案按水泥行业 / 配额方案「生产线」口径覆写，避免复用钢铁报告模板措辞。
 */
(function (global) {
  'use strict';

  function isGrindingStation(name) {
    return /粉磨/.test(String(name || ''));
  }

  function resolveProvinceName(meta, pack) {
    var blob =
      String((meta && meta.region) || '') +
      String((meta && meta.name) || '') +
      String((pack && pack.enterpriseName) || '');
    if (/河南|安阳|焦作|洛阳|郑州|博爱/.test(blob)) return '河南';
    if (/山西|大同|广灵/.test(blob)) return '山西';
    if (/内蒙古|包头|呼和浩特|阿巴嘎/.test(blob)) return '内蒙古';
    if (/辽宁|鞍山/.test(blob)) return '辽宁';
    if (/陕西|铜川|宝鸡|扶风|泾阳/.test(blob)) return '陕西';
    if (/重庆|璧山|合川|江津/.test(blob)) return '重庆';
    if (/黑龙江|吉林|扶余|磐石/.test(blob)) return '吉林';
    return '河北';
  }

  function round3(n) {
    return Math.round(Number(n) * 1000) / 1000;
  }

  /**
   * 构建水泥行业智能对标报告模型（对齐全国碳市场水泥配额方案：熟料生产线 / 吨熟料强度）
   */
  function buildCementReportModel(reportApi, payload, pack) {
    var result = (payload && payload.result) || {};
    var ranking = result.rankingMeta || {};
    var meta = pack.getEnterpriseMeta(pack.activeEnterpriseId);
    var enterpriseName =
      (payload && payload.enterpriseName) ||
      pack.enterpriseName ||
      (meta && meta.name) ||
      '冀东水泥集团';
    var periodLabel = reportApi._resolveReportPeriodLabel(payload, result);
    var periodKey = reportApi._resolvePeriodKey(payload, result);
    var profile = pack.getPeriod(periodKey) || {};
    var bench = pack.industryBenchmark || {};
    var grinding = isGrindingStation(enterpriseName);
    var provinceName = resolveProvinceName(meta, pack);

    var provinceAvg = grinding ? 0.48 : 0.86;
    var industryAvg =
      ranking.avgIntensity != null
        ? ranking.avgIntensity
        : bench.avgIntensity != null
          ? bench.avgIntensity
          : grinding
            ? 0.46
            : 0.82;
    var industryAdvanced =
      bench.best != null ? bench.best : grinding ? 0.36 : 0.65;
    var enterpriseIntensity =
      ranking.intensity != null
        ? ranking.intensity
        : profile.co2Intensity != null
          ? profile.co2Intensity
          : grinding
            ? 0.44
            : 0.77;
    var enterpriseRank = ranking.rank || (grinding ? 68 : 96);
    var totalEnterprises = ranking.total || bench.total || 310;
    var outputWanTon = 8.2;
    if (profile.steelOutput != null) {
      outputWanTon = profile.month
        ? profile.steelOutput
        : Math.round((profile.steelOutput / 12) * 10) / 10;
    }

    var quotaCombined = grinding
      ? {
          name: '水泥粉磨生产线',
          intensity: round3(enterpriseIntensity),
          rank: enterpriseRank,
          provinceAvg: provinceAvg,
          industryAvg: round3(industryAvg * 0.98),
          industryAdvanced: round3(industryAdvanced * 0.95),
        }
      : {
          name: '水泥熟料生产线',
          intensity: round3(
            profile.clinkerIntensity != null
              ? profile.clinkerIntensity
              : enterpriseIntensity * 1.08
          ),
          rank: Math.max(12, enterpriseRank - 8),
          provinceAvg: round3(provinceAvg * 1.02),
          industryAvg: round3(industryAvg * 1.01),
          industryAdvanced: round3(industryAdvanced * 1.05),
        };

    var quotaMetricLabel = grinding
      ? '水泥粉磨站边界碳排放量与水泥产量的比值（tCO₂e/t 水泥）'
      : '水泥熟料生产线吨熟料碳排放量（tCO₂e/t 熟料）';
    var quotaCalcNote = grinding
      ? '粉磨站边界碳排放量 / 水泥产量，均取核查或业务系统快报数据；全国碳市场水泥配额以硅酸盐水泥熟料生产线为核定单元，粉磨站对标侧重电耗与吨水泥强度'
      : '水泥熟料生产线碳排放量 / 熟料产量，均取核查后数据；偏离度＝（水泥行业平衡值 − 吨熟料碳排放量）/ 水泥行业平衡值，核定配额＝排放量×（1+碳排放强度系数）';

    var processRanks = grinding
      ? [
          {
            name: '水泥粉磨生产线',
            intensity: round3(enterpriseIntensity),
            rank: enterpriseRank,
            tier: 'mid',
            provinceAvg: provinceAvg,
            industryAvg: round3(industryAvg),
            industryAdvanced: industryAdvanced,
          },
          {
            name: '原料烘干',
            intensity: round3(enterpriseIntensity * 0.22),
            rank: enterpriseRank + 18,
            tier: 'mid',
            provinceAvg: round3(provinceAvg * 0.24),
            industryAvg: round3(industryAvg * 0.22),
            industryAdvanced: round3(industryAdvanced * 0.18),
          },
          {
            name: '包装与输送',
            intensity: round3(enterpriseIntensity * 0.08),
            rank: enterpriseRank + 36,
            tier: 'weak',
            provinceAvg: round3(provinceAvg * 0.07),
            industryAvg: round3(industryAvg * 0.07),
            industryAdvanced: round3(industryAdvanced * 0.05),
          },
          {
            name: '公辅动力系统',
            intensity: round3(enterpriseIntensity * 0.12),
            rank: enterpriseRank + 42,
            tier: 'weak',
            provinceAvg: round3(provinceAvg * 0.1),
            industryAvg: round3(industryAvg * 0.1),
            industryAdvanced: round3(industryAdvanced * 0.07),
          },
        ]
      : [
          {
            name: '熟料烧成（窑系统/分解炉）',
            intensity: round3(quotaCombined.intensity),
            rank: quotaCombined.rank,
            tier: 'mid',
            provinceAvg: quotaCombined.provinceAvg,
            industryAvg: quotaCombined.industryAvg,
            industryAdvanced: quotaCombined.industryAdvanced,
          },
          {
            name: '水泥粉磨生产线',
            intensity: round3(enterpriseIntensity * 0.18),
            rank: Math.max(20, enterpriseRank - 12),
            tier: 'advantage',
            provinceAvg: round3(provinceAvg * 0.22),
            industryAvg: round3(industryAvg * 0.2),
            industryAdvanced: round3(industryAdvanced * 0.16),
          },
          {
            name: '原料制备 / 矿山开采',
            intensity: round3(enterpriseIntensity * 0.08),
            rank: enterpriseRank + 24,
            tier: 'mid',
            provinceAvg: round3(provinceAvg * 0.09),
            industryAvg: round3(industryAvg * 0.085),
            industryAdvanced: round3(industryAdvanced * 0.06),
          },
          {
            name: '余热发电与公辅',
            intensity: round3(enterpriseIntensity * 0.06),
            rank: enterpriseRank + 40,
            tier: 'weak',
            provinceAvg: round3(provinceAvg * 0.055),
            industryAvg: round3(industryAvg * 0.05),
            industryAdvanced: round3(industryAdvanced * 0.035),
          },
        ];

    if (profile.processBench && profile.processBench.length) {
      processRanks = profile.processBench.map(function (row, idx) {
        var base = processRanks[idx] || processRanks[processRanks.length - 1] || {};
        return Object.assign({}, base, {
          name: row.name || base.name,
          intensity: row.intensity != null ? row.intensity : base.intensity,
          rank: row.rank != null ? row.rank : base.rank,
        });
      });
    }

    var gapToAdvanced = round3(enterpriseIntensity - industryAdvanced);
    var betterThanProvince = round3(provinceAvg - enterpriseIntensity);
    var betterThanIndustry = round3(industryAvg - enterpriseIntensity);
    var quotaGapProvince = round3(quotaCombined.provinceAvg - quotaCombined.intensity);
    var quotaGapIndustry = round3(quotaCombined.industryAvg - quotaCombined.intensity);
    var quotaGapAdvanced = round3(quotaCombined.industryAdvanced - quotaCombined.intensity);
    var lineA = processRanks[0];
    var lineB = processRanks[1];
    var lineC = processRanks[2];
    var lineD = processRanks[3];

    var productUnit = grinding ? 't 水泥' : 't 熟料';
    var poolLabel = '全国水泥重点排放单位（熟料生产线样本池）';

    var positioning =
      '本报告为' +
      enterpriseName +
      '专属智能对标分析专项报告，在碳排放强度与重点生产线对标之外，系统展开能耗对标、产量对标、规模对标、生产设施对标、生产线明细、污染物与配额碳成本等多维研判；' +
      '配额口径对齐全国碳市场水泥行业「水泥熟料生产线 / 吨熟料碳排放量 / 行业平衡值 / 碳排放强度系数」规则，' +
      '综合客户业务系统、佳华双碳云图与互联网公开数据，为企业经营决策、履约管理、技改规划提供数据支撑。';

    var quotaAnalysis = grinding
      ? '横向对标显示，本统计周期「' +
        quotaCombined.name +
        '」碳排放强度为 ' +
        quotaCombined.intensity +
        ' tCO₂e/' +
        productUnit +
        '，低于' +
        provinceName +
        '省粉磨站均值（' +
        quotaCombined.provinceAvg +
        '，低 ' +
        quotaGapProvince +
        '）、行业均值（' +
        quotaCombined.industryAvg +
        '，低 ' +
        quotaGapIndustry +
        '），但距行业先进值（' +
        quotaCombined.industryAdvanced +
        '）仍高出约 ' +
        Math.abs(quotaGapAdvanced) +
        '，行业排名第 ' +
        quotaCombined.rank +
        ' 位，整体处于水泥粉磨站中游偏上、电耗与碳效优于区域均值、仍可对标先进挖潜的区间。' +
        '粉磨站无熟料烧成窑系统，全国碳市场水泥配额以硅酸盐水泥熟料生产线为核定加总单元；本站对标重点在磨机系统电耗、烘干热源结构、外购熟料碳足迹衔接与绿电占比。' +
        '差异解读需提示水泥品种结构、熟料掺入比、负荷率、统计边界及核查/快报时点差异，避免将排名波动直接等同于工艺优劣。'
      : '横向对标显示，本统计周期「' +
        quotaCombined.name +
        '」吨熟料碳排放强度为 ' +
        quotaCombined.intensity +
        ' tCO₂e/t 熟料，低于' +
        provinceName +
        '省均值（' +
        quotaCombined.provinceAvg +
        '，低 ' +
        quotaGapProvince +
        '）、行业均值（' +
        quotaCombined.industryAvg +
        '，低 ' +
        quotaGapIndustry +
        '），但距行业先进值（' +
        quotaCombined.industryAdvanced +
        '）仍高出约 ' +
        Math.abs(quotaGapAdvanced) +
        '，行业排名第 ' +
        quotaCombined.rank +
        ' 位，整体处于全国水泥熟料生产线中游偏上、碳效优于省内与行业基准、仍可对标先进挖潜的区间。' +
        '结合熟料烧成与水泥粉磨分项表现：窑系统/分解炉热工制度与燃料替代、预热器与篦冷机余热回收仍是合并强度与配额占用的主导贡献环节，粉磨线电耗挖潜可作为辅助抓手。' +
        '差异解读需客观提示原料结构（石灰石品位、替代原燃料、电石渣替代率）、能源结构、统计口径与生产线边界及核查/快报时点差异等风险点，避免将排名波动直接等同于工艺优劣。';

    var quotaAdvice = grinding
      ? '针对当前水泥粉磨生产线碳强度优于省内与行业均值、但仍落后于先进值的现状，建议将碳管理由“被动履约观察”转向“强度—电耗—成本”一体化：' +
        '一是按月滚动测算吨水泥电耗与碳排放强度，排产与绿电采购联动；' +
        '二是对磨机系统、烘干与公辅建立能耗台账，优先实施高效磨机改造、变频优化与余热/余压利用；' +
        '三是若集团内存在熟料线配额盈缺，按法人边界统筹 CEA 调剂，避免粉磨站与熟料线割裂决策；' +
        '四是将粉磨线强度波动纳入经营例会，形成“强度—产量—电耗”一体化决策。'
      : '针对当前水泥熟料生产线碳强度优于省内与行业均值、但仍落后于先进值的现状，建议将碳配额由“被动履约”转向“经营资产”管理：' +
        '一是按月滚动测算配额盈缺与碳排放强度偏离度，排产与核查排放联动，把握富余配额处置窗口；' +
        '二是巩固窑系统/分解炉燃料结构优化与余热发电成效，建立熟料线配额占用台账，优先将富余额度对冲缺口或反哺烧成节能技改；' +
        '三是履约期前评估 CEA 与 CCER 组合，避免集中购碳抬升成本；' +
        '四是将熟料烧成—水泥粉磨生产线强度与分项波动纳入经营例会，形成“强度—熟料产量—配额”一体化决策。';

    var enterpriseAnalysis =
      gapToAdvanced > 0
        ? '企业层级碳排放强度为 ' +
          enterpriseIntensity +
          ' tCO₂/t，优于' +
          provinceName +
          '省均值（' +
          provinceAvg +
          ' tCO₂/t，低 ' +
          betterThanProvince +
          '）与全国水泥行业均值（' +
          industryAvg +
          ' tCO₂/t，低 ' +
          betterThanIndustry +
          '），在纳入全国碳市场的约 ' +
          totalEnterprises +
          ' 家' +
          poolLabel +
          '中排名第 ' +
          enterpriseRank +
          ' 位，整体处于行业中上区间。' +
          '相较行业先进值 ' +
          industryAdvanced +
          ' tCO₂/t，仍高出约 ' +
          gapToAdvanced +
          ' tCO₂/t，对应吨产品碳成本与配额占用差已具备经营敏感度。' +
          '同时须提示：生产负荷、熟料掺入比/水泥品种结构及核查口径调整，会对企业级强度与排名形成短期扰动，月度对标应结合工况说明一并解读。'
        : '企业层级碳排放强度为 ' +
          enterpriseIntensity +
          ' tCO₂/t，已优于' +
          provinceName +
          '省均值（' +
          provinceAvg +
          '）、全国水泥行业均值（' +
          industryAvg +
          '）及行业先进值（' +
          industryAdvanced +
          '），在约 ' +
          totalEnterprises +
          ' 家' +
          poolLabel +
          '中排名第 ' +
          enterpriseRank +
          ' 位，碳效处行业领先区间。仍须提示：生产工况与核查口径变化可能扰动指标，领先优势需通过生产线月度跟踪巩固。';

    var enterpriseAdvice = grinding
      ? '围绕追赶行业先进值目标，建议：强化磨机台时、电耗与烘干热源结构日管控；规范碳数据在粉磨站边界、排放因子与水泥产量口径上的一致性；' +
        '建立强度动态监测与预警，按月复盘强度—电耗联动；中长期按“高效粉磨—绿电替代—外购熟料低碳协同”梯次推进改造。'
      : '围绕追赶行业先进值目标，建议：强化窑系统、分解炉等主生产线能耗与燃料结构日管控；规范碳数据在生产线边界、排放因子与熟料产量口径上的一致性；' +
        '建立配额动态监测与预警，按月复盘强度—配额联动；中长期按“替代燃料—余热发电提效—原料替代（含电石渣等）”梯次推进低碳技改。';

    var processAnalysisItems = grinding
      ? [
          '水泥粉磨生产线：强度 ' +
            lineA.intensity +
            ' tCO₂/t、行业排名第 ' +
            lineA.rank +
            '，为站内主导排放环节，磨机电耗、助磨剂与台时产量是主要抓手。',
          '原料烘干：强度 ' +
            lineB.intensity +
            ' tCO₂/t、排名第 ' +
            lineB.rank +
            '，热风炉/余热利用方式影响明显，宜对标先进降低热耗。',
          '包装与输送：强度 ' +
            lineC.intensity +
            ' tCO₂/t、排名第 ' +
            lineC.rank +
            '，位次偏弱，输送系统能效与空载控制仍有空间。',
          '公辅动力系统：强度 ' +
            lineD.intensity +
            ' tCO₂/t、排名第 ' +
            lineD.rank +
            '，构成薄弱环节，压缩空气、照明与变压器损耗宜专项治理。',
        ]
      : [
          '熟料烧成（窑系统/分解炉）：强度 ' +
            lineA.intensity +
            ' tCO₂/t、行业排名第 ' +
            lineA.rank +
            '，为配额敏感主导生产线，燃料替代、热工制度与余热回收是改善重点。',
          '水泥粉磨生产线：强度 ' +
            lineB.intensity +
            ' tCO₂/t、排名第 ' +
            lineB.rank +
            '，属中游偏前辅助线，电耗与台时仍有对标先进挖潜空间。',
          '原料制备 / 矿山开采：强度 ' +
            lineC.intensity +
            ' tCO₂/t、排名第 ' +
            lineC.rank +
            '，相对靠后，破碎粉磨电耗与运输油耗需加强管控。',
          '余热发电与公辅：强度 ' +
            lineD.intensity +
            ' tCO₂/t、排名第 ' +
            lineD.rank +
            '，构成薄弱环节，余热发电机组负荷率与公辅能效应专项提升。',
        ];

    var processAnalysisSummary = grinding
      ? '综合看，水泥粉磨主线在可比口径下优于' +
        provinceName +
        '省均值与行业均值，但包装输送及公辅系统强度高于对应基准、距离行业先进仍有差距；负荷、品种结构与核算边界差异会影响指标与排名，宜作管理导向而非唯一考核依据。'
      : '综合看，熟料烧成与水泥粉磨主线在可比口径下优于' +
        provinceName +
        '省均值与行业均值，但原料制备及公辅系统强度高于对应基准、距离行业先进仍有差距；窑况、检修与生产线边界差异会影响指标与排名，宜作管理导向而非唯一考核依据。';

    var processAdvice = grinding
      ? '管理上建议分档施策：对水泥粉磨主线维持现有低碳优势并固化 SOP；重点推进磨机系统与烘干热源对标行业先进；' +
        '针对包装输送、公辅制定专项提升方案；规范各生产线碳数据采集核算，建立生产线碳强度月度跟踪机制。'
      : '管理上建议分档施策：对熟料烧成主线建立配额占用与强度偏离度台账；重点推进窑系统/分解炉节能降碳与替代燃料；' +
        '针对粉磨、原料制备与公辅制定专项提升方案；规范各生产线碳数据采集核算，建立生产线碳强度月度跟踪机制。';

    var advantages = [
      '企业层面：综合碳排放强度优于' +
        provinceName +
        '省均值与全国水泥行业均值，重点生产线口径亦优于省内与行业均值，具备碳配额经营与低碳竞争力基础。',
      grinding
        ? '生产线层面：水泥粉磨主线行业排名第 ' +
          lineA.rank +
          '，构成站内优势环节；烘干与公辅仍有对标先进空间，为后续电耗挖潜提供抓手。'
        : '生产线层面：熟料烧成行业排名第 ' +
          lineA.rank +
          '，水泥粉磨排名第 ' +
          lineB.rank +
          '，主流程碳效整体可控，为后续对标先进提供抓手。',
    ];
    var weaknesses =
      gapToAdvanced > 0
        ? [
            '企业层面：距行业先进值仍保留约 ' +
              gapToAdvanced +
              ' tCO₂/t 差距，对应履约成本与碳资产管理仍有优化空间；生产工况与核算口径扰动会影响排名稳定性。',
            grinding
              ? '生产线层面：包装输送及公辅动力位次靠后，制约站内强度进一步下探；外购熟料碳足迹与集团熟料线配额协同仍是管理重点。'
              : '生产线层面：原料制备及余热发电/公辅位次靠后，制约企业级强度进一步下探；窑系统作为配额敏感环节，对标先进仍有挖潜压力。',
          ]
        : [
            '企业层面：虽已贴近或优于行业先进值，领先优势仍受工况与口径扰动影响，需防范排名回落与富余配额管理粗放带来的机会损失。',
            grinding
              ? '生产线层面：包装输送及公辅仍制约结构优化；需持续巩固粉磨电耗优势并做好与熟料线的碳资产协同。'
              : '生产线层面：原料制备及公辅仍制约结构优化；窑系统作为配额敏感环节，对标头部先进仍有挖潜压力。',
          ];

    var actionSuggestions = grinding
      ? [
          '对标行业先进粉磨电耗参数，推进高效磨机/辊压机联合粉磨、变频优化与烘干余热利用，优先申报节能降碳技改资金。',
          '提升绿电采购与分布式光伏占比，降低外购电力隐含排放对吨水泥强度的拉动。',
          '建立粉磨线碳强度月度看板，并与集团熟料线配额盈缺模型联动，争取绿色信贷及财政支持。',
          '中长期对接低碳水泥产品认证与供应链碳足迹披露，提升碳市场价格波动下的经营韧性。',
        ]
      : [
          '对标行业先进窑系统与分解炉热工参数，推进替代燃料、预热器与篦冷机余热发电提效，优先申报国家及河北省节能降碳、超低排放协同技改资金。',
          '巩固粉磨电耗优势，同步补齐原料制备与公辅系统能效短板，形成“优势固化+薄弱专项整治”双轮路径。',
          '建立生产线碳强度月度看板与配额盈缺联动模型（对齐强度偏离度/强度系数口径），将降碳项目减排量纳入碳资产台账。',
          '中长期布局原料替代（含合规电石渣替代）、绿电采购与低碳熟料工艺示范，对接产业链低碳产品认证。',
        ];

    var potentialIntensityGap = gapToAdvanced > 0 ? gapToAdvanced : 0.05;
    var outputTon = outputWanTon * 10000;
    var totalPotentialTon = Math.round(outputTon * potentialIntensityGap);
    var processPotential = (
      grinding
        ? [
            {
              name: '水泥粉磨生产线',
              share: 0.55,
              logic: '按企业级强度追赶先进值的差距中，磨机系统电耗通常贡献最大份额；以差距×产量×贡献系数测算。',
            },
            {
              name: '原料烘干',
              share: 0.2,
              logic: '烘干热源结构与热效率改善可同步降碳、降本，按经验贡献约两成企业级潜力。',
            },
            {
              name: '公辅与包装输送',
              share: 0.15,
              logic: '压缩空气、输送与变压器损耗专项治理，可拉动站内综合强度。',
            },
            {
              name: '绿电与外购熟料协同',
              share: 0.1,
              logic: '绿电占比提升与外购熟料低碳协同，贡献剩余可挖潜空间。',
            },
          ]
        : [
            {
              name: '熟料烧成（窑系统/分解炉）',
              share: 0.52,
              logic: '按企业级强度追赶先进值的差距中，烧成系统通常贡献最大份额；以差距×熟料产量×贡献系数测算。',
            },
            {
              name: '水泥粉磨生产线',
              share: 0.18,
              logic: '粉磨电耗与台时优化可同步降碳、降本，按经验贡献约两成企业级潜力。',
            },
            {
              name: '替代燃料与原料替代',
              share: 0.18,
              logic: '提高替代燃料比例与合规原料替代，可降低烧成过程与燃料排放并拉动企业级指标。',
            },
            {
              name: '余热发电及公辅系统',
              share: 0.12,
              logic: '余热发电负荷率提升 + 公辅专项整治，贡献剩余可挖潜空间。',
            },
          ]
    ).map(function (item) {
      return {
        name: item.name,
        share: item.share,
        ton: Math.round(totalPotentialTon * item.share),
        logic: item.logic,
      };
    });

    var productLabel = grinding ? '水泥产量' : '熟料/水泥折算产量';
    var potentialNarrative =
      '测算逻辑：以企业层级碳排放强度较行业先进值的差距（' +
      potentialIntensityGap +
      ' tCO₂/t）为挖潜空间，结合本周期' +
      productLabel +
      '约 ' +
      outputWanTon +
      ' 万吨，估算月度理论减排潜力约 ' +
      totalPotentialTon.toLocaleString() +
      ' tCO₂（计算公式：减排潜力≈强度差距×产量）。再按水泥企业生产线经验将潜力拆分至主要环节——' +
      processPotential
        .map(function (p) {
          return p.name + '约 ' + Math.round(p.share * 100) + '%（约 ' + p.ton.toLocaleString() + ' tCO₂）';
        })
        .join('；') +
      '。上述潜力为理论上限，实际落地受技改投资节奏、窑/磨工况稳定性、绿电供给及政策资金到位情况影响；建议与国家节能降碳、超低排放改造类奖补资金申报节奏对齐，分年度兑现。';

    var dataSourceText =
      '本报告数据来源分三类：①客户自有（金隅/冀东业务系统 / 本地库）；②佳华自有（绿色低碳管理平台 · 佳华双碳云图，含模型推演项）；③互联网公开数据与全国碳市场水泥配额规则。';

    var model = {
      enterpriseName: enterpriseName,
      periodLabel: periodLabel,
      periodGrain: /^\d{4}$/.test(String((payload && payload.period) || '')) ? '年度' : '月度',
      periodDisplay: null,
      provinceName: provinceName,
      provinceAvg: provinceAvg,
      industryAvg: industryAvg,
      industryAdvanced: industryAdvanced,
      enterpriseIntensity: enterpriseIntensity,
      enterpriseRank: enterpriseRank,
      totalEnterprises: totalEnterprises,
      quotaCombined: quotaCombined,
      quotaMetricLabel: quotaMetricLabel,
      quotaCalcNote: quotaCalcNote,
      processRanks: processRanks,
      positioning: positioning,
      quotaAnalysis: quotaAnalysis,
      quotaAdvice: quotaAdvice,
      enterpriseAnalysis: enterpriseAnalysis,
      enterpriseAdvice: enterpriseAdvice,
      processAnalysis: processAnalysisItems.join('') + processAnalysisSummary,
      processAnalysisItems: processAnalysisItems,
      processAnalysisSummary: processAnalysisSummary,
      processAdvice: processAdvice,
      advantages: advantages,
      weaknesses: weaknesses,
      actionSuggestions: actionSuggestions,
      potentialNarrative: potentialNarrative,
      processPotential: processPotential,
      totalPotentialTon: totalPotentialTon,
      potentialIntensityGap: potentialIntensityGap,
      outputWanTon: outputWanTon,
      dataSourceText: dataSourceText,
      reportBrandEn: 'Cement Intelligent Benchmark Report',
      focusSectionTitle: '和重点生产线对标',
      processSectionTitle: '生产线碳排放强度数据对标',
      processSectionSub: '生产线层级碳排放强度排名',
      processLevelLabel: '生产线层级',
      potentialFootnote:
        '测算公式：月度理论减排潜力 ≈（企业强度 − 行业先进值）× 本周期产量；潜力拆分系按水泥企业生产线经验系数估算，实施效果以项目后评估为准。',
      footerBoundaryNote:
        '行业排名与外部基准来源于官方统计及行业公示口径，水泥熟料生产线边界差异可能导致指标扰动。',
    };

    if (payload && payload.sources) {
      model.dataSources = payload.sources;
    } else if (global.DemoSceneKernel && global.DemoSceneKernel.gatherSources) {
      model.dataSources = global.DemoSceneKernel.gatherSources(periodKey, pack.activeEnterpriseId);
    }

    if (global.CementReportExtras && global.CementReportExtras.buildExtraSectionsHTML) {
      model.extraSectionsHTML = global.CementReportExtras.buildExtraSectionsHTML(
        model,
        profile,
        periodLabel,
        pack
      );
    }

    return model;
  }

  function patchDataService() {
    var pack = global.JidongGroupData;
    var ds = global.BenchmarkDataService;
    if (!pack || !ds) return;

    pack.setActiveEnterprise(pack.activeEnterpriseId || 'jd-group');
    ds.DISPLAY.SELF = pack.enterpriseName;
    ds.DISPLAY.INDUSTRY_AVG = '行业均值（全国水泥）';
    ds.DISPLAY.BENCHMARK = '行业标杆（前5%）';
    ds.DISPLAY.COMPARE_TARGET = '区域内标杆企业';
    ds.DISPLAY.PEER_MASK = '某水泥企业';
    ds.INDUSTRY_POOL['水泥'] = Object.assign({ unit: 'tCO₂/t' }, pack.industryBenchmark);

    ds.getEnterpriseProfile = function (slots) {
      var key =
        typeof ds.getPeriodKey === 'function'
          ? ds.getPeriodKey(slots || {})
          : (slots && slots.timeValue) || '2026';
      return pack.getPeriod(key);
    };

    if (!ds._jidongPatchedDemo) {
      ds._jidongPatchedDemo = true;
      var origDemo = ds.getDemoIntensity;
      ds.getDemoIntensity = function (industry, slots) {
        var profile = pack.getPeriod(
          slots && typeof ds.getPeriodKey === 'function' ? ds.getPeriodKey(slots) : '2026'
        );
        if (profile && profile.co2Intensity != null) return profile.co2Intensity;
        return origDemo.call(ds, industry || '水泥', slots);
      };
    }

    var origBuildResult = ds.buildResultByFocus;
    if (typeof origBuildResult === 'function' && !ds._jidongPatchedBuild) {
      ds._jidongPatchedBuild = true;
      ds.buildResultByFocus = function (slots, source, text) {
        slots.industry = '水泥';
        return origBuildResult.call(ds, slots, source, text);
      };
    }

    if (!ds._jidongPatchedAnswer) {
      ds._jidongPatchedAnswer = true;
      var origAnswer = ds.buildAnswerText;
      if (typeof origAnswer === 'function') {
        ds.buildAnswerText = function (focus, userText, slots, ranking, dataSource) {
          var text = origAnswer.call(this, focus, userText, slots, ranking, dataSource);
          var name = pack.enterpriseName || '冀东水泥集团';
          return String(text || '')
            .replace(/河南钢铁集团/g, name)
            .replace(/安阳钢铁/g, name)
            .replace(/安钢/g, name)
            .replace(/中钢协/g, '水泥行业协会')
            .replace(/吨钢/g, '吨熟料/水泥')
            .replace(/钢铁行业/g, '水泥行业')
            .replace(/钢企/g, '水泥企业')
            .replace(/河南钢铁集团生产系统/g, '金隅冀东碳排放管理平台')
            .replace(/（河南钢铁集团生产系统数据）/g, '（金隅/冀东业务台账与本地库数据）');
        };
      }
    }

    if (global.BenchmarkIntent && !global.BenchmarkIntent._jidongPatched) {
      global.BenchmarkIntent._jidongPatched = true;
      var origThink = global.BenchmarkIntent.buildThinkingSteps;
      if (typeof origThink === 'function') {
        global.BenchmarkIntent.buildThinkingSteps = function (intent, willShowResult) {
          var steps = origThink.call(this, intent, willShowResult);
          var name = pack.enterpriseName || '冀东水泥集团';
          return (steps || []).map(function (s) {
            return String(s)
              .replace(/河南钢铁集团/g, name)
              .replace(/安阳钢铁/g, name)
              .replace(/安钢/g, name)
              .replace(/中钢协/g, '水泥行业协会')
              .replace(/吨钢/g, '吨熟料/水泥')
              .replace(/钢企/g, '水泥企业')
              .replace(/高炉、转炉工序/g, '烧成与粉磨生产线')
              .replace(/高炉-转炉/g, '烧成系统');
          });
        };
      }
    }

    if (global.BenchmarkSlotFilling && !global.BenchmarkSlotFilling._jidongPatched) {
      global.BenchmarkSlotFilling._jidongPatched = true;
      var origApply = global.BenchmarkSlotFilling.applyDefaults;
      global.BenchmarkSlotFilling.applyDefaults = function (text) {
        origApply.call(this, text);
        this.slots.industry = '水泥';
        if (
          global.DemoSceneKernel &&
          global.DemoSceneKernel.detectYearlyBenchmarkIntent &&
          global.DemoSceneKernel.detectYearlyBenchmarkIntent(text)
        ) {
          this.slots.timeDimension = 'yearly';
          this.slots.timeValue = global.DemoSceneKernel.resolveYearPeriod(text);
          this.slots.functionType = 'comparison';
          this.slots.queryFocus = 'comprehensive';
        } else if (/今年|本年|年度|全年/.test(String(text || ''))) {
          this.slots.timeDimension = 'yearly';
          this.slots.timeValue = global.DemoSceneKernel
            ? global.DemoSceneKernel.resolveYearPeriod(text)
            : String(new Date().getFullYear());
        }
        this.slots.objectDimension = 'enterprise';
        return this.getSlots();
      };
    }

    if (global.BenchmarkReport && !global.BenchmarkReport._jidongPatchedName) {
      global.BenchmarkReport._jidongPatchedName = true;
      global.BenchmarkReport._resolveEnterpriseName = function () {
        return pack.enterpriseName || '冀东水泥集团';
      };
      var origModel = global.BenchmarkReport.buildSteelReportModel;
      if (typeof origModel === 'function') {
        global.BenchmarkReport.buildSteelReportModel = function (payload) {
          // group-ledger 场景直接输出水泥报告模型，不再落钢铁默认文案
          return buildCementReportModel(this, payload, pack);
        };
      }

      var origSource = global.BenchmarkReport.buildDataSourceHTML;
      global.BenchmarkReport.buildDataSourceHTML = function (model) {
        if (
          global.CementReportExtras &&
          global.CementReportExtras.buildRichDataSourceHTML &&
          model &&
          model.dataSources &&
          model.dataSources.length
        ) {
          var rich = global.CementReportExtras.buildRichDataSourceHTML(model, pack);
          if (rich) return rich;
        }
        return origSource.call(this, model);
      };

      var origCompose = global.BenchmarkReport._composeReportHTML;
      global.BenchmarkReport._composeReportHTML = function (payload, chartId) {
        var html = origCompose.call(this, payload, chartId);
        if (!html || !payload || payload.kernel !== 'group-ledger-jidong') return html;
        var model = this.buildSteelReportModel(payload);
        var hidden =
          (payload.hiddenSections && payload.hiddenSections.slice()) ||
          (pack && pack.hiddenSections) ||
          [];

        if (model.extraSectionsHTML) {
          var extra = model.extraSectionsHTML;
          if (hidden.length && global.ReportSectionRegistry) {
            extra = global.ReportSectionRegistry.stripSectionsFromHTML(extra, hidden);
          }
          html = html.replace(
            '<div class="section" id="s5"><h2>05 · 优势与短板</h2>',
            extra + '<div class="section" id="s5"><h2>05 · 优势与短板</h2>'
          );
        }

        if (hidden.length && global.ReportSectionRegistry) {
          html = global.ReportSectionRegistry.stripSectionsFromHTML(html, hidden);
        }

        return html;
      };
    }

    if (typeof HenanSteelData !== 'undefined') {
      HenanSteelData.enterpriseName = pack.enterpriseName;
      HenanSteelData.getPeriod = function (key) {
        return pack.getPeriod(key);
      };
      HenanSteelData.getBenchmarkProfiles = function (key) {
        return pack.getBenchmarkProfiles(key);
      };
      HenanSteelData.industryBenchmark = pack.industryBenchmark;
      HenanSteelData.sources = pack.sources;
    }
  }

  function setActiveCapability(id) {
    var kernel = global.DemoSceneKernel;
    if (!kernel) return;
    kernel.capabilities.forEach(function (c) {
      c.active = c.id === id;
    });
    document.querySelectorAll('.gl-kernel-cap').forEach(function (btn) {
      var on = btn.getAttribute('data-cap') === id;
      btn.classList.toggle('is-active', on);
    });
  }

  function selectEnterprise(id) {
    var pack = global.JidongGroupData;
    if (!pack) return;
    var meta = pack.setActiveEnterprise(id);
    patchDataService();
    var label = document.getElementById('gl-kernel-enterprise');
    if (label) label.textContent = meta.name;
    var input = document.getElementById('gl-kernel-search');
    if (input) input.value = meta.name;
    hideSuggest();
  }

  function hideSuggest() {
    var box = document.getElementById('gl-kernel-suggest');
    if (box) {
      box.hidden = true;
      box.innerHTML = '';
    }
  }

  function renderSuggest(list) {
    var box = document.getElementById('gl-kernel-suggest');
    if (!box) return;
    if (!list.length) {
      box.hidden = false;
      box.innerHTML = '<div class="gl-kernel-suggest__empty">未找到匹配企业，请换「水泥」「冀东」「北水」等关键词（单选）</div>';
      return;
    }
    box.hidden = false;
    box.innerHTML = list
      .map(function (ent) {
        return (
          '<button type="button" class="gl-kernel-suggest__item" data-ent="' +
          ent.id +
          '">' +
          '<strong>' +
          ent.name +
          '</strong><span>' +
          ent.region +
          '</span></button>'
        );
      })
      .join('');
    box.querySelectorAll('[data-ent]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectEnterprise(btn.getAttribute('data-ent'));
      });
    });
  }

  function mountUi() {
    var welcome = document.querySelector('.cta-welcome');
    if (!welcome || document.getElementById('gl-kernel-panel')) return;

    var pack = global.JidongGroupData;
    var kernel = global.DemoSceneKernel;
    if (!pack || !kernel) return;

    var panel = document.createElement('section');
    panel.id = 'gl-kernel-panel';
    panel.className = 'gl-kernel-panel';
    panel.setAttribute('aria-label', '集团碳账本能力入口');
    panel.innerHTML =
      '<div class="gl-kernel-dialog">' +
      '<label class="gl-kernel-dialog__label" for="gl-kernel-search">搜索 / 对话</label>' +
      '<div class="gl-kernel-dialog__box">' +
      '<input id="gl-kernel-search" type="search" autocomplete="off" ' +
      'placeholder="输入企业关键词（如水泥、冀东、北水）或对标问题…" />' +
      '<button type="button" class="gl-kernel-dialog__go" id="gl-kernel-go" title="发送到对话框">发送</button>' +
      '<div id="gl-kernel-suggest" class="gl-kernel-suggest" hidden></div>' +
      '</div>' +
      '<p class="gl-kernel-current">当前分析企业：<strong id="gl-kernel-enterprise">' +
      pack.enterpriseName +
      '</strong><span class="gl-kernel-current__scope"> · 金隅集团 ' +
      (typeof JinyuOrgEnterprises !== 'undefined' ? JinyuOrgEnterprises.length : pack.enterprises.length) +
      ' 家可选（单选）</span></p>' +
      '</div>' +
      '<div class="gl-kernel-caps" id="gl-kernel-caps" role="list"></div>';

    var desc = welcome.querySelector('.cta-welcome__desc');
    var askSection = welcome.querySelector('.cta-welcome__section--ask');
    if (desc && askSection) {
      welcome.insertBefore(panel, askSection);
    } else if (desc && desc.parentNode) {
      desc.parentNode.insertBefore(panel, desc.nextSibling);
    } else {
      welcome.appendChild(panel);
    }

    var caps = document.getElementById('gl-kernel-caps');
    kernel.capabilities.forEach(function (cap) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gl-kernel-cap';
      btn.setAttribute('role', 'listitem');
      btn.setAttribute('data-cap', cap.id);
      if (cap.accent) btn.setAttribute('data-accent', cap.accent);
      if (cap.id === 'qa') btn.classList.add('gl-kernel-cap--qa');
      if (cap.id === 'benchmark' || cap.accent === 'warn') btn.classList.add('gl-kernel-cap--bench');
      if (cap.active) btn.classList.add('is-active');
      btn.innerHTML =
        '<span class="gl-kernel-cap__title">' +
        cap.label +
        '</span>' +
        '<span class="gl-kernel-cap__hint">' +
        (cap.id === 'qa'
          ? '通用问答'
          : cap.id === 'askData'
            ? '指标问数'
            : cap.id === 'benchmark'
              ? '对标分析'
              : cap.id === 'trade'
                ? '碳交易助手'
                : '扩展能力') +
        '</span>';
      btn.addEventListener('click', function () {
        setActiveCapability(cap.id);
        var input = document.getElementById('cta-input');
        var search = document.getElementById('gl-kernel-search');
        if (cap.id === 'benchmark') {
          var prompt = '给我进行一下今年的对标分析';
          if (search) search.value = prompt;
          if (input) {
            input.value = prompt;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.focus();
          }
        } else if (input && search && search.value.trim()) {
          input.value = search.value.trim();
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.focus();
        }
      });
      caps.appendChild(btn);
    });

    var search = document.getElementById('gl-kernel-search');
    var goBtn = document.getElementById('gl-kernel-go');

    function pushSearchToChat() {
      var q = search.value.trim();
      if (!q) return;
      var input = document.getElementById('cta-input');
      var sendBtn = document.getElementById('cta-send');
      if (input) {
        input.value = q;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (sendBtn && !sendBtn.disabled) sendBtn.click();
    }

    search.addEventListener('input', function () {
      var q = search.value.trim();
      if (!q || /对标|分析|查询|对比|报告|全部/.test(q)) {
        hideSuggest();
        return;
      }
      if (q.length < 2) {
        hideSuggest();
        return;
      }
      renderSuggest(pack.searchEnterprises(q));
    });
    search.addEventListener('focus', function () {
      var q = search.value.trim();
      if (q.length >= 2 && !/对标|分析|查询|对比|报告|全部/.test(q)) {
        renderSuggest(pack.searchEnterprises(q));
      }
    });
    search.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        hideSuggest();
        pushSearchToChat();
      }
    });
    goBtn.addEventListener('click', function () {
      hideSuggest();
      pushSearchToChat();
    });
    document.addEventListener('click', function (ev) {
      if (!panel.contains(ev.target)) hideSuggest();
    });
  }

  function toast(msg) {
    if (global.DualCarbonHub && global.DualCarbonHub.showToast) {
      global.DualCarbonHub.showToast(msg);
      return;
    }
    alert(msg);
  }

  function appendAssistantNote(html) {
    var messages = document.getElementById('cta-messages');
    var welcome = document.getElementById('cta-welcome');
    if (!messages) return;
    if (welcome) welcome.classList.add('hidden');
    messages.classList.remove('hidden');
    var div = document.createElement('div');
    div.className = 'cta-msg cta-msg--assistant';
    div.innerHTML =
      '<div class="cta-msg__bubble"><div class="cta-msg__content">' + html + '</div></div>';
    messages.appendChild(div);
    var scroll = document.getElementById('cta-scroll');
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
  }

  function readFileText(file) {
    return new Promise(function (resolve) {
      var reader = new FileReader();
      var name = String(file.name || '').toLowerCase();
      var isText =
        /text\//.test(file.type || '') ||
        /\.(txt|csv|md|json|log)$/i.test(name);
      reader.onerror = function () {
        resolve('');
      };
      reader.onload = function () {
        var result = reader.result;
        if (typeof result === 'string') {
          resolve(result);
          return;
        }
        try {
          var bytes = new Uint8Array(result || []);
          var out = '';
          var run = '';
          for (var i = 0; i < bytes.length; i++) {
            var b = bytes[i];
            if (b === 9 || b === 10 || b === 13 || (b >= 32 && b < 127)) {
              run += String.fromCharCode(b);
            } else if (b >= 0x80) {
              run += '';
            } else {
              if (run.length >= 4) out += run + '\n';
              run = '';
            }
          }
          if (run.length >= 4) out += run;
          try {
            var decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
            if (decoded && decoded.replace(/\u0000/g, '').length > out.length) {
              out = decoded.replace(/\u0000+/g, ' ');
            }
          } catch (e2) {}
          resolve(out.slice(0, 80000));
        } catch (e) {
          resolve('');
        }
      };
      if (isText) reader.readAsText(file);
      else reader.readAsArrayBuffer(file);
    });
  }

  /** 回形针暂存、尚未点发送的文件 */
  var pendingFiles = [];

  function escAttr(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function notifySendReady() {
    var input = document.querySelector(
      '.agent-copilot-input textarea, .agent-copilot-input input[type="text"], #cta-input'
    );
    if (input) {
      try {
        input.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (e) {
        var ev = document.createEvent('Event');
        ev.initEvent('input', true, true);
        input.dispatchEvent(ev);
      }
    }
  }

  function resolveReportPeriod() {
    try {
      var raw = sessionStorage.getItem('gl-jidong-duibiao-report-meta');
      if (raw) {
        var meta = JSON.parse(raw);
        if (meta && meta.period) return String(meta.period);
      }
    } catch (e) {}
    return String(new Date().getFullYear());
  }

  function hasPendingUploads() {
    return pendingFiles.length > 0;
  }

  function stageFiles(fileList) {
    if (!fileList || !fileList.length) return;
    var added = 0;
    Array.prototype.forEach.call(fileList, function (file) {
      if (!file || !file.name) return;
      var dup = pendingFiles.some(function (f) {
        return f.name === file.name && f.size === file.size;
      });
      if (dup) return;
      pendingFiles.push(file);
      added += 1;
    });
    renderUploadChips();
    notifySendReady();
    if (added) {
      toast('已添加 ' + added + ' 份材料，点击发送箭头完成上传');
    }
  }

  function appendUserUploadBubble(files, extraText) {
    var messages = document.getElementById('cta-messages');
    var welcome = document.getElementById('cta-welcome');
    if (!messages) return;
    if (welcome) welcome.classList.add('hidden');
    messages.classList.remove('hidden');
    var names = files
      .map(function (f) {
        return f.name;
      })
      .join('、');
    var body =
      (extraText ? escAttr(extraText) + '<br/>' : '') +
      '📎 上传材料：' +
      escAttr(names);
    var div = document.createElement('div');
    div.className = 'cta-msg is-user';
    div.innerHTML = '<div class="cta-msg__bubble">' + body + '</div>';
    messages.appendChild(div);
    var scroll = document.getElementById('cta-scroll');
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
  }

  function createUploadThinking() {
    var messages = document.getElementById('cta-messages');
    if (!messages) return null;
    var wrap = document.createElement('div');
    wrap.className = 'cta-msg cta-msg--assistant cta-msg--process';
    wrap.innerHTML =
      '<div class="cta-msg__bubble cta-msg__bubble--wide">' +
      '<div class="cta-thinking cta-thinking--query">' +
      '<div class="cta-thinking__head">' +
      '<span class="cta-thinking__spinner"></span>' +
      '<span class="cta-thinking__title">正在处理上传材料</span>' +
      '<span class="cta-thinking__elapsed"></span>' +
      '</div>' +
      '<div class="cta-thinking__body">' +
      '<p class="cta-thinking__hint">先解析文件内容，再融合修改报告指标与结论</p>' +
      '<ul class="cta-thinking__steps">' +
      '<li class="cta-thinking__step is-active" data-phase="parse">' +
      '<div class="cta-thinking__step-main">' +
      '<span class="cta-thinking__dot"></span>' +
      '<span class="cta-thinking__text">解析上传材料，提取可对标指标</span>' +
      '<span class="cta-thinking__status">进行中…</span>' +
      '</div></li>' +
      '<li class="cta-thinking__step is-pending" data-phase="fuse">' +
      '<div class="cta-thinking__step-main">' +
      '<span class="cta-thinking__dot"></span>' +
      '<span class="cta-thinking__text">融合材料内容，修改报告对应条目</span>' +
      '<span class="cta-thinking__status"></span>' +
      '</div></li>' +
      '</ul></div></div></div>';
    messages.appendChild(wrap);
    var scroll = document.getElementById('cta-scroll');
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
    return wrap;
  }

  function setThinkingPhase(wrap, phase, statusText) {
    if (!wrap) return;
    var root = wrap.querySelector('.cta-thinking');
    var steps = wrap.querySelectorAll('.cta-thinking__step');
    var title = wrap.querySelector('.cta-thinking__title');
    var spinner = wrap.querySelector('.cta-thinking__spinner');
    Array.prototype.forEach.call(steps, function (li) {
      var p = li.getAttribute('data-phase');
      var st = li.querySelector('.cta-thinking__status');
      if (p === phase) {
        li.classList.remove('is-pending', 'is-done');
        li.classList.add('is-active');
        if (st) st.textContent = statusText || '进行中…';
      } else if (
        (phase === 'fuse' && p === 'parse') ||
        (phase === 'done' && (p === 'parse' || p === 'fuse'))
      ) {
        li.classList.remove('is-pending', 'is-active');
        li.classList.add('is-done');
        if (st) st.textContent = '完成';
      }
    });
    if (phase === 'done') {
      if (title) title.textContent = '上传材料处理完成';
      if (spinner) spinner.style.display = 'none';
      if (root) root.classList.add('is-collapsed');
    } else if (phase === 'fuse' && title) {
      title.textContent = '正在融合修改报告';
    }
  }

  function delay(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  /**
   * 发送箭头触发：解析 → 融合 → 输出修改说明 → 更新报告卡片
   */
  function tryConsumePendingUploads(userText) {
    var data = global.JidongGroupData;
    var files = pendingFiles.slice();
    pendingFiles = [];
    renderUploadChips();
    notifySendReady();

    if (!data || !files.length) {
      return Promise.resolve(false);
    }

    appendUserUploadBubble(files, userText);
    var thinking = createUploadThinking();

    return delay(700)
      .then(function () {
        return Promise.all(
          files.map(function (file) {
            return readFileText(file).then(function (text) {
              return { file: file, text: text };
            });
          })
        );
      })
      .then(function (parsedFiles) {
        setThinkingPhase(thinking, 'parse', '完成');
        var period = resolveReportPeriod();
        var items = [];
        var parseNotes = [];

        parsedFiles.forEach(function (pf) {
          var cat = data.classifyUpload(pf.file.name);
          var item = data.addUpload({
            name: pf.file.name,
            size: pf.file.size,
            type: pf.file.type,
            category: cat,
            extractedText: pf.text,
          });
          items.push(item);
          (item.changelog || []).forEach(function (c) {
            parseNotes.push(c);
          });
        });

        renderUploadChips();
        setThinkingPhase(thinking, 'fuse', '进行中…');
        return delay(900).then(function () {
          return { items: items, parseNotes: parseNotes, period: period };
        });
      })
      .then(function (ctx) {
        var allChanges = [];
        ctx.items.forEach(function (item) {
          var applied = data.applyUploadOptimizations(item, ctx.period);
          allChanges = allChanges.concat(applied.changes || applied.changelog || []);
        });

        setThinkingPhase(thinking, 'done');

        var hasReport =
          global.DemoSceneKernel &&
          global.DemoSceneKernel.hasActiveReport &&
          global.DemoSceneKernel.hasActiveReport();

        var explain =
          '<p><strong>文件解析与融合已完成</strong>，共处理 ' +
          ctx.items.length +
          ' 份材料。</p>';

        if (ctx.parseNotes.length) {
          explain +=
            '<p><strong>① 解析结果：</strong></p><ol>' +
            ctx.parseNotes
              .slice(0, 10)
              .map(function (c) {
                return '<li>' + escAttr(c) + '</li>';
              })
              .join('') +
            '</ol>';
        }

        explain +=
          '<p><strong>② 本次报告修改说明：</strong></p><ol>' +
          (allChanges.length
            ? allChanges
                .slice(0, 12)
                .map(function (c) {
                  return '<li>' + escAttr(c) + '</li>';
                })
                .join('')
            : '<li>未识别到可写入报告的指标，仅更新了学习笔记</li>') +
          '</ol>';

        if (hasReport && global.DemoSceneKernel.regenerateOptimizedReport) {
          explain +=
            '<p>下方已刷新<strong>智能对标分析报告</strong>，请打开核对修订结果。</p>';
          appendAssistantNote(explain);
          global.DemoSceneKernel.regenerateOptimizedReport({
            userText: userText || '根据上传材料优化报告',
            changelog: allChanges,
            updated: true,
          });
          toast('已按上传材料更新报告');
        } else {
          explain +=
            '<p>当前尚未生成报告。材料已学习入库；请先做对标分析生成报告，或稍后输入「根据上传材料更新报告」。</p>';
          appendAssistantNote(explain);
          toast('已学习 ' + ctx.items.length + ' 份材料');
        }

        return true;
      });
  }

  function renderUploadChips() {
    var bar = document.getElementById('jsl-upload-chips');
    var data = global.JidongGroupData;
    if (!bar) return;

    var html = '';
    pendingFiles.forEach(function (f, idx) {
      html +=
        '<span class="jsl-chip jsl-chip--pending" title="待发送">' +
        '📎 ' +
        escAttr(f.name) +
        '<em class="jsl-chip__tag">待发送</em>' +
        '<button type="button" data-pending-rm="' +
        idx +
        '" aria-label="移除">×</button></span>';
    });

    if (data && data.uploads && data.uploads.length) {
      data.uploads.forEach(function (u) {
        html +=
          '<span class="jsl-chip" title="' +
          escAttr(u.summary || '') +
          '">📎 ' +
          escAttr(u.name) +
          '<em class="jsl-chip__tag jsl-chip__tag--done">已学习</em>' +
          '<button type="button" data-rm="' +
          escAttr(u.id) +
          '" aria-label="移除">×</button></span>';
      });
    }

    if (!html) {
      bar.hidden = true;
      bar.innerHTML = '';
      return;
    }
    bar.hidden = false;
    bar.innerHTML = html;

    bar.querySelectorAll('button[data-pending-rm]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = parseInt(btn.getAttribute('data-pending-rm'), 10);
        if (!isNaN(i)) pendingFiles.splice(i, 1);
        renderUploadChips();
        notifySendReady();
      });
    });
    if (data) {
      bar.querySelectorAll('button[data-rm]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          data.removeUpload(btn.getAttribute('data-rm'));
          renderUploadChips();
        });
      });
    }
  }

  function wireUpload() {
    if (document.getElementById('jsl-file-input')) return;

    var inputBar = document.querySelector('.cta-input-bar .agent-copilot-input');
    if (!inputBar) return;

    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'jsl-file-input';
    fileInput.multiple = true;
    fileInput.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg';
    fileInput.hidden = true;
    document.body.appendChild(fileInput);

    var chips = document.createElement('div');
    chips.id = 'jsl-upload-chips';
    chips.className = 'jsl-upload-chips';
    chips.hidden = true;
    inputBar.parentNode.insertBefore(chips, inputBar);

    var attachBtn = inputBar.querySelector('.agent-copilot-input__icon-btn[title="上传附件"]');
    if (attachBtn) {
      attachBtn.removeAttribute('tabindex');
      attachBtn.addEventListener('click', function (e) {
        e.preventDefault();
        fileInput.click();
      });
    }

    fileInput.addEventListener('change', function () {
      stageFiles(fileInput.files);
      fileInput.value = '';
    });
  }

  function exportUploadApi() {
    if (!global.DemoSceneKernel) global.DemoSceneKernel = {};
    global.DemoSceneKernel.hasPendingUploads = hasPendingUploads;
    global.DemoSceneKernel.tryConsumePendingUploads = tryConsumePendingUploads;
  }

  function boot() {
    if (!global.DemoSceneProfile || global.DemoSceneProfile.id !== 'group-ledger') return;
    patchDataService();
    exportUploadApi();
    if (global.document.readyState === 'loading') {
      global.document.addEventListener('DOMContentLoaded', function () {
        patchDataService();
        mountUi();
        wireUpload();
        exportUploadApi();
      });
    } else {
      mountUi();
      wireUpload();
    }
    // 脚本在 agent 之后加载时再补一次
    setTimeout(function () {
      patchDataService();
      mountUi();
      wireUpload();
      exportUploadApi();
    }, 0);
  }

  boot();
})(window);
