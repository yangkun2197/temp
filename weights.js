'use strict';

//var baseTimeStamp = Date.parse(new Date('2010/01/01 00:00:00'));
//var baseTime = new Date('2016/01/01 00:00:00');

var dataMoments = [];

//初始化数据
function initData() {
    dataMoments = dataTemplate;
    //处理时间戳
    dataMoments = dataMoments.map(function (el) {
        el.createDateStamp = Date.parse(el.createDate);
        el.modifyDateStamp = Date.parse(el.modifyDate);
        //el.undef = 1;
        return el;
    });

    console.log('-------------处理身边事生命周期------------------------');
    var sensitivity = 1.9;//敏感度  值越小 敏感度越高
    console.log('敏感度：' + sensitivity);

    dataMoments = dataMoments.map(function (el) {
        var d = Math.sub(el.modifyDateStamp, el.createDateStamp);
        if (d <= 0) {
            el.ltv = 0;
            return el;
        } else {
            var coefficient = Math.div(Math.sub(1, Math.pow(d, Math.sub(1, sensitivity))), Math.sub(sensitivity, 1));     //公式     （1- d的（1-x）次方）/(x-1)   x是敏感值 

            el.ltv = Math.floor(Math.mul(coefficient, el.modifyDateStamp));

            //console.log(el.content + ' 的生命周期值是 ' + el.ltv);
            return el;
        }
    });
    //dataMoments = dataMoments.sort(arrSortby("modifyDate")); 
    //console.log(JSON.stringify(dataMoments)); 
}
initData();
console.log('-------------------------------------');

//存储页面输出内容用
var outputHtml = '';

//权重设置
var weightOptions = {
    //未定义
    'undef': {
        text: '未定义',
        weight: 0.3,//权重
        mean: 1,//均值
        stddev: 0//标准差
    },
    //评论数权重
    'comments': {
        text: '评论数',
        weight: 0.04,
        mean: 1,
        stddev: 0
    },
    //信息类型(事/店)
    'type': {
        text: '信息类型(店/事)',
        weight: 0.35,
        mean: 1,
        stddev: 0
    },
    //生命周期权重 
    'ltv': {
        text: '生命周期',
        weight: 0.01,
        mean: 1,
        stddev: 0
    },
    //创建时间权重 
    'createDate': {
        text: '创建时间',
        weight: 0.2,
        mean: 1,
        stddev: 0
    },
    //认证权重 
    'auth': {
        text: '认证状态',
        weight: 0.1,
        mean: 1,
        stddev: 0
    }
};

var undefWeight = Math.mul(weightOptions.undef.stddev, weightOptions.undef.weight);
//weightOptions.modifyDate = Math.sub(1, weightOptions.comments);//计算更新时间的权重 。  1 - 评论数权重 
console.log('权值设置：' + JSON.stringify(weightOptions));


//求和函数
function sum(a, b) {
    return Math.add(a, b);
}
//平方函数
function square(a) {
    return Math.mul(a, a);
}


//计算样本中权重因子的均值和标准差
function getMeansStddev(weightKey) {
    var mean = 1;
    var stddev = 0;
    var deviations = null;
    var variance = null;
    switch (weightKey) {
        // default:
        // case 'undef':
        //     mean = 1;
        //     //stddev = 0; 
        //     //偏差
        //     var deviations = dataMoments.map(function (x) { return Math.sub(1, mean); });
        //     //方差
        //     var variance = deviations.map(square).reduce(sum) / (dataMoments.length);
        //     //标准差
        //     stddev = Math.sqrt(variance);

        //     break;
        case 'comments':
        case 'type':
            //均值
            mean = dataMoments.reduce(function (a, b) {
                return Math.add(a, b[weightKey]);
            }, 0) / dataMoments.length;
            //偏差
            deviations = dataMoments.map(function (x) { return Math.sub(x[weightKey], mean); });
            //方差
            variance = deviations.map(square).reduce(sum) / (dataMoments.length);
            //标准差
            stddev = Math.sqrt(variance);
            break;

        case 'undef':
            //均值
            // mean = dataMoments.reduce(function (a, b) {
            //     return Math.add(a, b.userdefine);
            // }, 0) / dataMoments.length;

            var tmpMean = 0;
            dataMoments.forEach(function (el) {
                tmpMean += el.userdefine;
            });
            console.log(tmpMean + '.........');
            mean = tmpMean / dataMoments.length;

            //偏差
            deviations = dataMoments.map(function (x) { return Math.sub(x.userdefine, mean); });
            //方差
            variance = deviations.map(square).reduce(sum) / (dataMoments.length);
            //标准差
            stddev = Math.sqrt(variance);
            break;

        case 'auth':
            //均值
            mean = dataMoments.reduce(function (a, b) {
                return Math.add(a, b.auth);
            }, 0) / dataMoments.length;
            //偏差
            deviations = dataMoments.map(function (x) { return Math.sub(x.auth, mean); });
            //方差
            variance = deviations.map(square).reduce(sum) / (dataMoments.length);
            //标准差
            stddev = Math.sqrt(variance);
            break;


        case 'createDate':
            //均值
            mean = dataMoments.reduce(function (a, b) {
                return Math.add(a, b.createDateStamp);
            }, 0) / dataMoments.length;
            //偏差
            deviations = dataMoments.map(function (x) { return Math.sub(x.createDateStamp, mean); });
            //方差
            variance = deviations.map(square).reduce(sum) / (dataMoments.length);
            //标准差
            stddev = Math.sqrt(variance);
            break;

        case 'ltv':
            //均值
            mean = dataMoments.reduce(function (a, b) {
                return Math.add(a, b.ltv);
            }, 0) / dataMoments.length;
            //偏差
            deviations = dataMoments.map(function (x) { return Math.sub(x.ltv, mean); });
            //方差
            variance = deviations.map(square).reduce(sum) / (dataMoments.length);
            //标准差
            stddev = Math.sqrt(variance);

            break;
    }
    console.log('计算：' + weightKey + '的均值和标准差---------------------');
    console.log('均值：' + mean);
    //console.log('偏差：' + JSON.stringify(deviations));
    console.log('方差：' + variance);
    console.log('标准差：' + stddev);

    return { mean: mean, stddev: stddev };
}

//计算所有权重以及的均值和标准差
for (var key in weightOptions) {
    var rel = getMeansStddev(key);
    weightOptions[key].mean = rel.mean;
    weightOptions[key].stddev = rel.stddev;
}


console.log('-------------------------------------');


/**
 *  计算权值  标准分数 x 权值比例     
 *  标准分 Z=（x-μ)/σ 
  * 标准分= (观察分数 - 平均分)/标准差
            
*/
function calWeight(parm, weightKey) {
    if (weightOptions[weightKey].stddev == 0) {
        return 0;
    }
    return (Math.mul(Math.div(Math.sub(parm, weightOptions[weightKey].mean), weightOptions[weightKey].stddev), weightOptions[weightKey].weight)).toFixed(6);
}

//将计算好的数据 输出到页面中
function generateHtml() {
    outputHtml = '';
    var tm3 = dataMoments.map(function (el) {
        el.weight = 0;
        el.weightText = '';
        for (var key in weightOptions) {
            var weight = 0.00;
            var weightText = ' ';
            switch (key) {
                case 'undef':
                    weight = calWeight(el.userdefine, key);
                    break;
                case 'auth':
                    weight = calWeight(el.auth, key);
                    break;
                case 'ltv':
                    weight = calWeight(el.ltv, key);
                    break;
                case 'comments':
                    weight = calWeight(el.comments, key);
                    break;

                case 'type':
                    weight = calWeight(el.type, key);
                    break;

                case 'createDate':
                    weight = calWeight(el.createDateStamp, key);
                    break;
            }
            el.weight = Math.add(el.weight, parseFloat(weight));

            el.weightText = el.weightText + weightOptions[key].text + '(' + weight + ') + ';
        }

        el.weightText = el.weightText.substring(0, el.weightText.length - 2);
        el.weightText += ' = 最终权值 (' + el.weight.toFixed(6) + ')\n\r';

        outputHtml += formatHtml(el);

        // var ltvWeight = Math.mul(Math.div(Math.sub(el.ltv, weightOptions.ltv.mean), weightOptions.ltv.stddev), weightOptions.ltv.weight).toFixed(6);

        // var commentsWeight = Math.mul(Math.div(Math.sub(el.comments, weightOptions.comments.mean), weightOptions.comments.stddev), weightOptions.comments.weight).toFixed(6);

        // var typeWeight = Math.mul(Math.div(Math.sub(el.type, weightOptions.type.mean), weightOptions.type.stddev), weightOptions.type.weight).toFixed(6);

        // var createDateWeight = Math.mul(Math.div(Math.sub(el.createDateStamp, weightOptions.createDate.mean), weightOptions.createDate.stddev), weightOptions.createDate.weight).toFixed(6);

        /*3σ准则又称为拉依达准则
        利用3σ进行规一化，落在 [-1 , 1] 之间的概率是99.7%，在实际应用中我们将落在[-1 , 1] 区间之外的值均设成-1和1，以保证所有的数值均落在[-1 , 1] 范围之内
        
        var t_ltv = Math.div(Math.sub(el.ltv, modifyDateMean), Math.mul(3, modifyDateStddev));
        var t_comments = Math.div(Math.sub(el.comments, commentsMean), Math.mul(3, commentsStddev));
        if (t_ltv > 1) t_ltv = 1;
        if (t_ltv < -1) t_ltv = -1;

        if (t_comments > 1) t_comments = 1;
        if (t_comments < -1) t_comments = -1;

        var ltvWeight = Math.mul(t_ltv, weightOptions.modifyDate).toFixed(6);
        var commentsWeight = Math.mul(t_comments, weightOptions.comments).toFixed(6);
*/

        // el.weight = (parseFloat(ltvWeight)
        //     + parseFloat(commentsWeight)
        //     + parseFloat(typeWeight)
        //     + parseFloat(createDateWeight)
        //     + parseFloat(undefWeight)).toFixed(6);

        // el.weightText = '评论数权值 (' + commentsWeight
        //     + ') + 创建时间权值 (' + createDateWeight
        //     + ') + 生命周期权值 (' + ltvWeight
        //     + ') + 信息类型权值 (' + typeWeight
        //     + ') + 未定义权值 (' + undefWeight
        //     + ') = 最终权值 (' + el.weight + ')\n\r';

        // outputHtml += formatHtml(el);
        return el.weight;
    });

    //打印到页面
    document.getElementById('momentsList').innerHTML = '<ol>' + outputHtml + '</ol>';
}

setTimeout(function () {
    generateHtml();
}, 500);
console.log('-------------------------------------');

$(function () {

    //生成表单
    var formHtml = '';

    for (var key in weightOptions) {
        formHtml += '<p><label for="">' + weightOptions[key].text + '(' + key + ')' + ':</label>' +
            '<input type="text" id="' + key + 'Weight" value="' + weightOptions[key].weight + '"></p>';
    }

    formHtml += '<button type="button" id="rebuild">计算</button>';
    $('.form').html(formHtml);

    $(document).on('click', '#rebuild', function (e) {
        var _self = $(e.target);
        var validate = true;
        var tmpSum = 0;
        $('.form input').each(function (index, el) {
            var $self = $(el);
            if ($self.val() < 0 || $self.val() > 1) {
                validate = false;
            }
            tmpSum = Math.add(tmpSum, parseFloat($self.val()));
        });
        //console.log('validate:'+validate);
        if (tmpSum != 1) {
            validate = false;
        }
        //console.log('validate:'+validate);
        //console.log('tmpSum ' + tmpSum);

        if (validate == false) {
            alert('权重设置错误');
            return false;
        }

        _self.text('计算中......').attr('disabled', 'disabled');

        $('.form input').each(function (index, el) {
            var key = $(el).attr('id').replace(/Weight/g, '');
            weightOptions[key].weight = $(el).val();
        });

        //console.log(weightOptions); 
        // var $this = $('#commentsWeight');
        // weightOptions.comments = $this.val();
        // weightOptions.modifyDate = Math.sub(1, weightOptions.comments);
        // $('#modifyDateWeight').val(weightOptions.modifyDate);

        setTimeout(function () {
            generateHtml();
            _self.html('计算').removeAttr('disabled');
            alert('计算完毕');
        }, 500);
    })
});

function formatHtml(el) {
    var tmp = '';
    for (var p in el) {
        var name = p;//属性名称 
        var value = el[name];//属性对应的值 

        if (name.indexOf('Date') > -1 && name.indexOf('Stamp') == -1) {
            tmp += formatName(name) + ' : ' + moment(value).format('YYYY-MM-DD hh:mm:ss') + '  <br/>  ';
        } else if (name == 'weight') {
            tmp += formatName(name) + ' : <span = class="weight">' + value.toFixed(6) + ' </span> <br/>  ';
        } else if (name == 'type') {
            tmp += formatName(name) + ' : ' + (value == 1 ? '身边事' : '店') + value + '  <br/>  ';
        }
        else if (name == 'auth') {
            tmp += formatName(name) + ' : ' + (value == 1 ? '未认证' : '已认证') + value + '  <br/>  ';
        }
        else {
            tmp += formatName(name) + ' : ' + value + '  <br/>  ';
        }
    }
    return '<li> ' + tmp + ' </li>';
}

function formatName(name) {
    var rel = '';
    switch (name) {
        case 'content':
            rel = '身边事内容(' + name + ')';
            break;
        case 'createDate':
            rel = '创建时间(' + name + ')';
            break;
        case 'modifyDate':
            rel = '更新时间(' + name + ')';
            break;
        case 'createDateStamp':
            rel = '创建时间戳(' + name + ')';
            break;
        case 'modifyDateStamp':
            rel = '更新时间戳(' + name + ')';
            break;
        case 'ltv':
            rel = '生命周期时间戳(' + name + ')';
            break;
        case 'type':
            rel = '信息类型(' + name + ')';
            break;
        case 'auth':
            rel = '认证状态(' + name + ')';
            break;
        case 'userdefine':
            rel = '未定义(' + name + ')';
            break;
        case 'comments':
            rel = '评论数(' + name + ')';
            break;
        case 'weight':
            rel = '权值(' + name + ')';
            break;
        case 'weightText':
            rel = '权值描述(' + name + ')';
            break;

    }
    return '<span class="title">' + rel + '</span>';
}

//by函数接受一个成员名字符串做为参数
//并返回一个可以用来对包含该成员的对象数组进行排序的比较函数
function arrSortby(name) {
    return function (o, p) {
        var a, b;
        if (typeof o === "object" && typeof p === "object" && o && p) {
            a = o[name];
            b = p[name];
            if (a === b) {
                return 0;
            }
            if (typeof a === typeof b) {
                return a < b ? -1 : 1;
            }
            return typeof a < typeof b ? -1 : 1;
        }
        else {
            throw ("error");
        }
    }
}



// var dateStamp = (moment().diff(moment(baseTime), 'hours'));

// console.log('test:' + dateStamp);

// console.log('test2:' + Date.parse(new Date()));






        //console.log(JSON.stringify(dataMoments.map(function(el){return el.weight})));


        //console.log(Math.pow(0,(1-1.5)));

        // var d = 2;
        // var x = 0.8;
        // var rel = 





//console.log(tm3);

//console.log('-------------------折算成小时------------------------');

// modifyDateMean = Math.div(modifyDateMean, 60 * 60 * 1000);
// modifyDateDeviations = modifyDateDeviations.map(function(el) { return Math.div(el, 60 * 60 * 1000); });
// modifyDateVariance = Math.div(modifyDateVariance, 60 * 60 * 1000);
// modifyDateStddev = Math.div(modifyDateStddev, 60 * 60 * 1000);
// console.log('更新时间均值(折算成小时)：' + modifyDateMean);
// console.log('更新时间偏差(折算成小时)：' + modifyDateDeviations);
// console.log('更新时间方差(折算成小时)：' + modifyDateVariance);
// console.log('更新时间标准差(折算成小时)：' + modifyDateStddev);



//更新时间均值     通过原始数据 抽样 获得
//var modifyDateMean = dataMoments.reduce(function(a, b) { return (moment(a.modifyDate).diff(moment(b.modifyDate), 'hours')); }) / dataMoments.length;

//-------------求更新时间标准差----------------------------------

// dataMoments = dataMoments.map(function(el) {
//     //参数d（身边事生命周期）    修改时间-创建时间  折算成小时
//     var d = (moment(el.modifyDate).diff(moment(el.createDate), 'hours'));
//     /*
//         ((1-Math.pow(参数d,(1-敏感度sensitivity)))/(敏感度sensitivity-1))*创建时间或者最后更新时间
//      */
//     //获取系数
//     var coefficient = (Math.sub(1, Math.pow(d, Math.sub(1, sensitivity))) / Math.sub(sensitivity, 1));
//     console.log('系数:' + coefficient);

//     //更新时间 的时间戳   （更新时间-初始时间  折算成小时）
//     var modifyDateStamp = Math.div(el.modifyDateStamp, 60 * 60 * 1000);    //Date.parse(createDate) -baseTimeStamp;

//     console.log('参数d(更新时间(' + moment(el.modifyDate).format('YYYY-MM-DD hh:mm:ss') + ')-创建时间(' + moment(el.createDate).format('YYYY-MM-DD hh:mm:ss') + '),折算成小时):' + d);

//     //更新时间 权值 初始值
//     var initialModifyDateWeight = Math.mul(coefficient, modifyDateStamp);
//     //更新时间归一化处理
//     initialModifyDateWeight = Math.div(Math.sub(initialModifyDateWeight, modifyDateMean), modifyDateStddev);


//     console.log('系数 * 更新时间 = ' + initialModifyDateWeight);

//     //评论数归一化处理
//     var initialCommentsWeight = Math.div(Math.sub(el.comments, commentsMean), commentsStddev);

//     //评论数 权值   最终
//     var commentsWeight = Math.mul(initialCommentsWeight, weightOptions.comments);

//     //更新时间 权值   最终
//     var modifyDateWeight = Math.mul(initialModifyDateWeight, weightOptions.modifyDate);

//     //权值汇总  得到最终权值
//     el.weight = Math.add(commentsWeight, modifyDateWeight);

//     el.weightText = '最终权值  =  评论数权值 (' + commentsWeight + ') + 更新时间权值 (' + modifyDateWeight + ') = ' + el.weight + '\n\r';
//     console.log(el.weightText);

//     outputHtml += formatHtml(el);

//     return el;
// });
