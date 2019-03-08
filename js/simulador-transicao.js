var segurado = {
  sexo: "",
  idade: "",
  tempo_contribuicao: "",
  salario_beneficio: "",
  tempo_contribuicao_para_aposentar: "",
  regra_1: "",
  regra_2: "",
  regra_3: ""
};

function setSexo(sexo) {
  $(".sexo").removeClass("mark-genero");

  segurado.sexo = sexo;
  $("#sexo").val(sexo);
  $("#sexo-" + sexo).addClass("mark-genero");
}

$("#sexo-m").click(function () {
  setSexo("m");
});

$("#sexo-f").click(function () {
  setSexo("f");
});

$("#idade").on("focusout keyup", function (event) {
  segurado.idade = parseFloat($(this).val());

  //  $(this).removeClass('form-control-danger');

  // $(this).addClass("form-control-danger");
  // console.log(event);
});

$("#tempo-contribuicao").on("focusout keyup", function (event) {
  segurado.tempo_contribuicao = parseFloat($(this).val());

  //  $(this).removeClass('form-control-danger');

  // $(this).addClass("form-control-danger");
  // console.log(event);
});


$("#salario-beneficio").on("focusout keyup", function (event) {
  segurado.salario_beneficio = parseFloat($(this).val());
});

$(document).ready(function () {
  // $('#salario-beneficio').mask('000.000,00', {reverse: true});
  $("#idade").mask('00', { reverse: true });
  $("#tempo-contribuicao").mask('00', { reverse: true });
});

function validateSegurado(segurado) {

  if (segurado.idade <= segurado.tempo_contribuicao) {
    alert('O tempo de contribuição não pode ser maior que a idade.');
    return false;
  }


  if (segurado.sexo == '' || typeof segurado.sexo === 'undefined') {
    alert('Selecione o sexo.');
    return false;
  }

  if (segurado.idade == '' || typeof segurado.idade === 'undefined' || segurado.idade < 15) {
    alert('A idade não é válida.');
    return false;
  }

  if (segurado.tempo_contribuicao == '' || typeof segurado.tempo_contribuicao === 'undefined' || segurado.tempo_contribuicao <= 0) {
    alert('O Tempo de contribuição não é válido.');
    return false;
  }

  if (segurado.tempo_contribuicao != '' && segurado.sexo != '' && segurado.idade != '') {
    return true;
  }

}


function setSegurado() {
  segurado.sexo = $("#sexo").val();
  segurado.idade = parseFloat($("#idade").val());
  segurado.tempo_contribuicao = parseInt($("#tempo-contribuicao").val());
  segurado.salario_beneficio = parseFloat($("#salario-beneficio").val());
}




function regraLegislacaoAtual() {
  $('#alerta-regra-atual').html('');
  var contribuicao_min = { m: 35, f: 30 };
  var idade_min = { m: 65, f: 60 };
  var text = '';
  var regra = false;


  if (
   ( segurado.tempo_contribuicao >= 15 && segurado.idade >= idade_min[segurado.sexo]) ||
   (segurado.tempo_contribuicao >= contribuicao_min[segurado.sexo])
    ) {
    var text = ' Você já alcançou os requisitos atuais para concessão do benefício.';
    regra = true;
  }

  if (regra) {
    $('#alerta-regra-atual').html(`<div class="alert alert-primary alert-dismissible">
        <button type="button" class="close" data-dismiss="alert">&times;</button>
              <strong>Aviso:</strong> ${text}
        </div>`);
  }
}




$('input[type=text]').on('keydown', function (e) {
  if (e.which == 13) {
    e.preventDefault();
    $("#calcular").click();
  }
});

$("#calcular").click(function () {
  setSegurado();
  regraLegislacaoAtual();


  if (validateSegurado(segurado)) {
    segurado.regra_1 = verifiqueRegra_1();
    grafRegra1(segurado.regra_1);
    msgRegra1(segurado.regra_1);
    // tabelaRegra1(segurado.regra_1)

    segurado.regra_2 = verifiqueRegra_2();
    grafRegra2(segurado.regra_2);
    msgRegra2(segurado.regra_2);

    segurado.regra_3 = verifiqueRegra_3();
    msgRegra3(segurado.regra_3);
    // console.log(segurado);
  }

});

// Regra 1 - transicao de pontos 

/**
 * Regra 1: regra de pontos. Elevação em um ponto por ano. Em
    2019: 96/86 e em 2033 105/100. Cálculo: 60%+2% por ano de
    contribuição que exceder 20 anos de tempo de contribuição.
    Redução de 5 anos nos pontos para professores, que
    começam em 2019 com a regra 81/91 até atingir 95/100, com
    a mesma elevação anual.
 * 
 */
function verifiqueRegra_1() {
  var contribuicao_min = {
    m: 35,
    f: 30
  };

  var regra_pontos_i = { y: 2019, m: 96, f: 86 };
  var regra_pontos_f = { y: 2033, m: 105, f: 100 };
  var ano = moment('2019', 'YYYY', true);
  var ano_chart;
  var idade = segurado.idade;
  var tempo_contribuicao = segurado.tempo_contribuicao;
  var pontos = segurado.idade + segurado.tempo_contribuicao;
  var evolucao = [];
  var maxPontos = regra_pontos_f[segurado.sexo];
  var ano_correcao = false;
  var ano_string;

  if (pontos >= regra_pontos_i[segurado.sexo]  &&  tempo_contribuicao >= contribuicao_min[sexo]) {
    segurado.ano_para_aposentar = ano;
    return {
      ano: ano,
      pontos: pontos,
      ponto_atuais: (segurado.idade + segurado.tempo_contribuicao),
      erro: null
    };
  } else {
    while (!getRegra1(pontos, ano.format("YYYY"), segurado.sexo, tempo_contribuicao)) {

      ano = ano.add(0.5, 'y');
      idade += 0.5;
      tempo_contribuicao += 0.5;
      pontos = idade + tempo_contribuicao;
      ano_chart = ano.year();

      evolucao.push({
        ano: ano_chart,
        idade: idade,
        tempo_contribuicao: tempo_contribuicao,
        pontos: pontos
      });


    }

    // evolucao.push({
    //   ano: ano,
    //   idade: idade,
    //   tempo_contribuicao: tempo_contribuicao,
    //   pontos: pontos
    // });

    if (ano.month() > 0) {
      ano_string = ano.locale('pt-BR').format("MMMM/YYYY");
    } else {
      ano_string = ano.locale('pt-BR').format("YYYY");
    }

    segurado.ano_para_aposentar = ano;

    return {
      ano: ano,
      ano_string: ano_string,
      pontos: pontos,
      idade: idade,
      tempo_contribuicao: tempo_contribuicao,
      ponto_atuais: (segurado.idade + segurado.tempo_contribuicao),
      evolucao: evolucao,
      sexo: segurado.sexo,
      erro: null
    };
  }


  function getRegra1(pontos, ano, sexo, tempo_contribuicao) {

  var contribuicao_min = {
      m: 35,
      f: 30
    };

    var regra1 = {
      2019: { m: 96, f: 86 },
      2020: { m: 97, f: 87 },
      2021: { m: 98, f: 88 },
      2022: { m: 99, f: 89 },
      2023: { m: 100, f: 90 },
      2024: { m: 101, f: 91 },
      2025: { m: 102, f: 92 },
      2026: { m: 103, f: 93 },
      2027: { m: 104, f: 94 },
      2028: { m: 105, f: 95 },
      2029: { m: 105, f: 96 },
      2030: { m: 105, f: 97 },
      2031: { m: 105, f: 98 },
      2032: { m: 105, f: 99 },
      2033: { m: 105, f: 100 }
    };


    if ((sexo == "m" && ano > 2028 && pontos >= 105) &&  tempo_contribuicao >= contribuicao_min[sexo]) {
      return true;
    }

    if ((sexo == "f" && ano > 2033 && pontos >= 100) &&  tempo_contribuicao >= contribuicao_min[sexo]) {
      return true;
    }

    return (((ano >= 2019 && ano <= 2033) && pontos >= regra1[ano][sexo]) &&  tempo_contribuicao >= contribuicao_min[sexo]) ? true : false;
  }

}


function grafRegra1(regra_1) {
  $('#chartRegra1').html('');

  var data = [
    { 'periodo': "2019", 'masc': 96, 'fem': 86 },
    { 'periodo': "2020", 'masc': 97, 'fem': 87 },
    { 'periodo': "2021", 'masc': 98, 'fem': 88 },
    { 'periodo': "2022", 'masc': 99, 'fem': 89 },
    { 'periodo': "2023", 'masc': 100, 'fem': 90 },
    { 'periodo': "2024", 'masc': 101, 'fem': 91 },
    { 'periodo': "2025", 'masc': 102, 'fem': 92 },
    { 'periodo': "2026", 'masc': 103, 'fem': 93 },
    { 'periodo': "2027", 'masc': 104, 'fem': 94 },
    { 'periodo': "2028", 'masc': 105, 'fem': 95 },
    { 'periodo': "2029", 'masc': 105, 'fem': 96 },
    { 'periodo': "2030", 'masc': 105, 'fem': 97 },
    { 'periodo': "2031", 'masc': 105, 'fem': 98 },
    { 'periodo': "2032", 'masc': 105, 'fem': 99 },
    { 'periodo': "2033", 'masc': 105, 'fem': 100 }
  ];

  var regra_pontos_i = { y: 2019, m: 96, f: 86 };
  var regra_pontos_f = { y: 2033, m: 105, f: 100 };
  var pontos = segurado.idade + segurado.tempo_contribuicao;

  if (pontos < regra_pontos_i[segurado.sexo]) {


    if (regra_1.ano.year() > 2033) {

      data.map(function (item) {
        if (item.periodo == '2019') {
          item.voce = regra_1.ponto_atuais;
        }
      });

      var item = { 'periodo': regra_1.ano.year().toString(), 'masc': 105, 'fem': 100, 'voce': regra_1.pontos };
      data.push(item);

    } else {
      function getProgressaoRegra1(ano, sexo) {
        var pontos_chart;
        for (const iterator of regra_1.evolucao) {
          if (iterator.ano == ano) {
            pontos_chart = iterator.pontos;
          }
        }
        return pontos_chart;
      }

      data.map(function (item) {

        if (regra_1.ano.year() >= item.periodo) {
          item.voce = getProgressaoRegra1(item.periodo, regra_1.sexo);
        }

      });
    }
  }

  new Morris.Line({
    element: 'chartRegra1',
    ymin: (regra_1.ponto_atuais < 80) ? regra_1.ponto_atuais : 80,
    ymax:  (regra_1.pontos > 105) ? regra_1.pontos : 105,
    lineWidth: '6px',
    data: data,
    xkey: 'periodo',
    //  parseTime: false,
    ykeys: ['masc', 'fem', 'voce'],
    labels: ['Homem', 'Mulher', 'Você'],
    lineColors: ['Blue', 'red', 'green'],
    events: [
      regra_1.ano.year().toString(),
    ],
    yLabelFormat: function (d) {
      return (d != undefined && d) ? Math.round(d) : '';
    },
  });


}



function msgRegra1(regra_1) {
  $('#msg-regra1').html('');
  var contribuicao_min = { m: 35, f: 30 };
  var idade_min = { m: 61, f: 56 };
  var text;
  var idadeRg1_string = '';
  var tempo_contribuicaoRg1_string = '';

  var idadeRg1 = moment.duration(regra_1.idade, 'y', true);
  var tempo_contribuicaoRg1 = moment.duration(regra_1.tempo_contribuicao, 'y', true);

  idadeRg1_string += (idadeRg1.years() > 0) ? idadeRg1.years() + ' ano(s) ' : '';
  idadeRg1_string += (idadeRg1.months() > 0) ? idadeRg1.months() + ' mes(es) ' : '';

  tempo_contribuicaoRg1_string += (tempo_contribuicaoRg1.years() > 0) ? tempo_contribuicaoRg1.years() + ' ano(s) ' : '';
  tempo_contribuicaoRg1_string += (tempo_contribuicaoRg1.months() > 0) ? tempo_contribuicaoRg1.months() + ' mes(es) ' : '';


  if (regra_1.ano_string != undefined) {
    text = `Você vai alcançar os pontos necessários em ${regra_1.ano_string} com ${idadeRg1_string} anos de idade e ${tempo_contribuicaoRg1_string} anos de contribuição.`;
  }

  if (regra_1.ano.year() == 2019) {
    $('#chartRegra1').html('');
    text = `Esta regra não é aplicável. Você já alcançou os requisitos atuais.`;
  }

  // if (segurado.tempo_contribuicao < contribuicao_min[segurado.sexo] && segurado.idade >= idade_min[segurado.sexo]) {
  //   // $('#chartRegra1').html('');
  //   var tempo_restante = contribuicao_min[segurado.sexo] - segurado.tempo_contribuicao;
  //   text = ` Está regra não é aplicável. Você ainda não possui tempo de contribuição necessário. Você precisa de mais ${tempo_restante} ${(tempo_restante > 1) ? 'anos' : 'ano'} de contribuíção.`;
  // }

  $('#msg-regra1').html(text)
}


function tabelaRegra1(regra_1) {
  $('#tabela-regra1').html('');

  var row = '';

  var percent = 60;
  var temp = 0;
  if (segurado.tempo_contribuicao > 20) {
    temp = segurado.tempo_contribuicao - 20;
    percent = 60 + (temp * 2);
  }


  for (const iterator of regra_1.evolucao) {
    if (iterator.tempo_contribuicao > 20) {
      row += `
          <tr>
          <td>${iterator.ano}</td>
          <td>${percent += 2}%</td>
          </tr>
          `
    }
  }


  $('#tabela-regra1').html(`
                          <table class="table table-condensed table-hover">
                                          <thead>
                                            <tr>
                                              <th>Ano</th>
                                              <th>Percentual</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            ${row}
                                          </tbody>
                                        </table>
                            `);
}





/**
 * Regra 2 - idade
 * 
 * Regra 2: conjugação de tempo de contribuição com idade
    mínima. 35 anos de contribuição para os homens e 30 para as
    mulheres + idade mínima inicial de 61 anos para os homens e
    56 para as mulheres, com elevação na idade mínima em 06
    meses por ano até atingir-se mínima 65 anos para homens e
    62 para mulheres em 2031. Cálculo: 60%+2% por ano de
    contribuição que exceder 20 anos de tempo de contribuição
    Bônus de 5 anos na idade mínima para professores, que
    sobem até 60 anos de idade para ambos os sexos.
 * 
 */

function verifiqueRegra_2() {

  var contribuicao_min = {
    m: 35,
    f: 30
  };


  var regra_idade_i = { y: 2019, m: 61, f: 56 };
  var regra_idade_f = { y: 2031, m: 65, f: 62 };
  var ano = 2019;
  var idade = segurado.idade;
  var tempo_contribuicao = segurado.tempo_contribuicao;
  var evolucao = [];

  if ((idade >= regra_idade_i[segurado.sexo]) && tempo_contribuicao >= contribuicao_min[segurado.sexo]) {

    return {
      ano: ano,
      idade: segurado.idade,
      erro: null
    };
  } else {
    while (!getRegra2(idade, ano, segurado.sexo)) {

      evolucao.push({
        ano: ano,
        idade: idade,
        tempo_contribuicao: tempo_contribuicao,
      });

      ano++;
      idade++;
      tempo_contribuicao++;

    }

    evolucao.push({
      ano: ano,
      idade: idade,
      tempo_contribuicao: tempo_contribuicao,
    });



    return {
      ano: ano,
      idade: idade,
      tempo_contribuicao: tempo_contribuicao,
      evolucao: evolucao,
      sexo: segurado.sexo,
      erro: null
    };
  }


  function getRegra2(idade, ano, sexo) {
    var contribuicao_min = {
      m: 35,
      f: 30
    };

    var regra2 = {
      2019: { m: 61, f: 56 },
      2020: { m: 61.5, f: 56.5 },
      2021: { m: 62, f: 57 },
      2022: { m: 62.5, f: 57.5 },
      2023: { m: 63, f: 58 },
      2024: { m: 63.5, f: 58.5 },
      2025: { m: 64, f: 59 },
      2026: { m: 64.5, f: 59.5 },
      2027: { m: 65, f: 60 },
      2028: { m: 65, f: 60.5 },
      2029: { m: 65, f: 61 },
      2030: { m: 65, f: 61.5 },
      2031: { m: 65, f: 62 }
    };

    if ((sexo == "m" && ano > 2027 && idade >= 65) &&  tempo_contribuicao >= contribuicao_min[sexo]) {
      return true;
    }

    if ((sexo == "f" && ano > 2031 && idade >= 62) &&  tempo_contribuicao >= contribuicao_min[sexo]) {
      return true;
    }

    return (((ano >= 2019 && ano <= 2031) && idade >= regra2[ano][sexo]) &&  tempo_contribuicao >= contribuicao_min[sexo]) ? true : false;

  }



}


function grafRegra2(regra_2) {

  $('#chartRegra2').html('');

  var data_regra_2 = [
    { "periodo": "2019", "masc": 61, "fem": 56 },
    { "periodo": "2020", "masc": 61.5, "fem": 56.5 },
    { "periodo": "2021", "masc": 62, "fem": 57 },
    { "periodo": "2022", "masc": 62.5, "fem": 57.5 },
    { "periodo": "2023", "masc": 63, "fem": 58 },
    { "periodo": "2024", "masc": 63.5, "fem": 58.5 },
    { "periodo": "2025", "masc": 64, "fem": 59 },
    { "periodo": "2026", "masc": 64.5, "fem": 59.5 },
    { "periodo": "2027", "masc": 65, "fem": 60 },
    { "periodo": "2028", "masc": 65, "fem": 60.5 },
    { "periodo": "2029", "masc": 65, "fem": 61 },
    { "periodo": "2030", "masc": 65, "fem": 61.5 },
    { "periodo": "2031", "masc": 65, "fem": 62 }
  ];

  var regra_idade_i = { y: 2019, m: 61, f: 56 };

  if (segurado.idade <= regra_idade_i[segurado.sexo]) {


    if (regra_2.ano > 2031) {

      var item = { 'periodo': regra_2.ano.toString(), 'masc': 65, 'fem': 62, 'voce': regra_2.idade };
      data_regra_2.push(item);

    } else {

      function getProgressaoRegra2(ano) {
        for (const iterator of regra_2.evolucao) {
          if (iterator.ano == ano) {
            return iterator.idade;
          }
        }
      }



      data_regra_2.map(function (item) {
        if (regra_2.ano >= item.periodo) {
          item.voce = getProgressaoRegra2(item.periodo);
        }

      });


    }
  }

  new Morris.Line({
    element: 'chartRegra2',
    ymin: (segurado.idade > 56) ? 56 : segurado.idade,
    ymax: 65,
    lineWidth: '6px',
    data: data_regra_2,
    xkey: 'periodo',
    ykeys: ['masc', 'fem', 'voce'],
    labels: ['Homem', 'Mulher', 'Você'],
    lineColors: ['Blue', 'red', 'green'],
    events: [
      regra_2.ano.toString(),
    ],
    yLabelFormat: function (d) {
      return (d != undefined && d) ? d.toFixed(1) : '';
    },
  });


}





function msgRegra2(regra_2) {

  $('#msg-regra2').html('');

  var contribuicao_min = { m: 35, f: 30 };
  var idade_min = { m: 65, f: 60 };

  var text = `Você vai alcançar a idade necessária no ano ${regra_2.ano} com a idade ${regra_2.idade} anos e ${regra_2.tempo_contribuicao} anos de tempo de contribuição.`;

  if (regra_2.ano == 2019 && ((segurado.tempo_contribuicao >= contribuicao_min[segurado.sexo]) && (segurado.idade >= idade_min[segurado.sexo]))) {
    $('#chartRegra2').html('');
    text = ` Está regra não é aplicável. Você já alcançou os requisitos atuais.`;
  }

  // var regra_idade_i = { y: 2019, m: 61, f: 56 };

  // if (segurado.tempo_contribuicao < contribuicao_min[segurado.sexo] && segurado.idade >= regra_idade_i[segurado.sexo]) {
  //   $('#chartRegra2').html('');
  //   var tempo_restante = contribuicao_min[segurado.sexo] - segurado.tempo_contribuicao;
  //   text = ` Está regra não é aplicável. Você  ainda não possui tempo de contribuição necessário.  Você precisa de mais ${tempo_restante} ${(tempo_restante > 1) ? 'anos' : 'ano'} de contribuíção.`;
  // }

  $('#msg-regra2').html(text);
}





//Regra 3

/**
 * Regra 3: Quem estiver até a 2 anos de se aposentar por
  tempo de contribuição mínimo poderá optar por aposentar-se
  sem cumprir idade mínima, mediante pagamento de pedágio
  de 50% do tempo que faltava e com a aplicação do fator
  previdenciário
 */
function verifiqueRegra_3() {

  var contribuicao_min = { m: 33, f: 28 };


  var contribuicao_max = { m: 35, f: 30 };

  var status;
  var tempo_restante = null;
  var tempo_total = null;
  var tempo_restante_string = '';
  var tempo_total_string = '';
  var ano = moment("2019", "YYYY");
  var idade = moment.duration(segurado.idade, 'y', true);
  var idade_string = '';
  var fator = 0;

  if (segurado.tempo_contribuicao >= contribuicao_min[segurado.sexo] && segurado.tempo_contribuicao < contribuicao_max[segurado.sexo]) {


    tempo_restante = ((contribuicao_max[segurado.sexo] - segurado.tempo_contribuicao) / 2) + (contribuicao_max[segurado.sexo] - segurado.tempo_contribuicao);
    tempo_total = segurado.tempo_contribuicao + tempo_restante;

    tempo_restante = moment.duration(tempo_restante, 'y', true);

    tempo_restante_string += (tempo_restante.years() > 0) ? tempo_restante.years() + ' ano(s) ' : '';
    tempo_restante_string += (tempo_restante.months() > 0) ? tempo_restante.months() + ' mes(es) ' : '';

    tempo_total = moment.duration(tempo_total, 'y', true);

    tempo_total_string += (tempo_total.years() > 0) ? tempo_total.years() + ' ano(s) ' : '';
    tempo_total_string += (tempo_total.months() > 0) ? tempo_total.months() + ' mes(es) ' : '';

    ano = ano.add(tempo_restante);
    ano = ano.locale('pt-BR').format("MMMM/YYYY")

    idade = idade.add(tempo_restante);

    idade_string += (idade.years() > 0) ? idade.years() + ' ano(s) ' : '';
    idade_string += (idade.months() > 0) ? idade.months() + ' mes(es) ' : '';

    fator = setFatorPrevidenciario(idade.years(), tempo_total.years());

    status = true;

  } else {

    status = false;

  }

  return {
    fator: fator,
    tempo_para_aposentar: tempo_restante_string,
    tempo_total: tempo_total_string,
    ano: ano,
    idade: idade_string,
    status: status,
  };

}





function msgRegra3(regra_3) {
  $('#msg-regra3').html('');



  var row;

  //  if (regra_3.ano == 2019) {
  //   text = ` Está regra não é aplicável. Você já alcançou os requisitos atuais.`;
  //}

  row = `
          <tr>
          <td>Fator previdenciário que será aplicado</td>
          <td>${regra_3.fator.toFixed(4)}</td>
          </tr>
          <tr>
          <td>Tempo de contribuição necessário (incluído o pedágio)</td>
          <td>${regra_3.tempo_para_aposentar}</td>
          </tr>
          <tr>
          <td>Tempo total de contribuição</td>
          <td>${regra_3.tempo_total}</td>
          </tr>
          <tr>
          <tr>
          <td>Mês/Ano em que cumpre o pedágio</td>
          <td>${regra_3.ano}</td>
          </tr>
          <tr>
          <td>Idade ao cumprir o pedágio</td>
          <td>${regra_3.idade}</td>
          </tr>
          `;

  if (regra_3.status) {
    $('#tabela-regra3').html(`<table class="table table-condensed table-hover"><tbody>${row}</tbody></table>`);
  } else {
    $('#tabela-regra3').html("Você não se enquadra nesta regra.");
  }


}


function setFatorPrevidenciario(idade, tempo_contribuicao) {
  var esObj = getEs(idade);

  var a = (tempo_contribuicao * 0.31) / esObj.Es;
  var b = 1 + ((parseFloat(idade) + parseFloat((tempo_contribuicao * 0.31))) / 100);
  soma = a * b;

  return soma;
}



function getEs(idade) {
  var listaEs = [
    { idade: 45, Es: 34.7 },
    { idade: 46, Es: 33.8 },
    { idade: 47, Es: 32.9 },
    { idade: 48, Es: 32.1 },
    { idade: 49, Es: 31.2 },
    { idade: 50, Es: 30.3 },
    { idade: 51, Es: 29.5 },
    { idade: 52, Es: 28.7 },
    { idade: 53, Es: 27.8 },
    { idade: 54, Es: 27.0 },
    { idade: 55, Es: 26.2 },
    { idade: 56, Es: 25.4 },
    { idade: 57, Es: 24.6 },
    { idade: 58, Es: 23.8 },
    { idade: 59, Es: 23.0 },
    { idade: 60, Es: 22.3 },
    { idade: 61, Es: 21.5 },
    { idade: 62, Es: 20.7 },
    { idade: 63, Es: 20.0 },
    { idade: 64, Es: 19.3 },
    { idade: 65, Es: 18.5 },
    { idade: 66, Es: 17.8 },
    { idade: 67, Es: 17.1 },
    { idade: 68, Es: 16.4 },
    { idade: 69, Es: 15.8 },
    { idade: 70, Es: 15.1 },
    { idade: 71, Es: 14.5 },
    { idade: 72, Es: 13.8 },
    { idade: 73, Es: 13.2 },
    { idade: 74, Es: 12.6 },
    { idade: 75, Es: 12.1 },
    { idade: 76, Es: 11.5 },
    { idade: 77, Es: 11.0 },
    { idade: 78, Es: 10.5 },
    { idade: 79, Es: 10.0 },
    { idade: 80, Es: 9.5 },
  ];

  var Es = listaEs.filter(item => item.idade == idade);

  return Es[0];

}




