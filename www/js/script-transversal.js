


// Declaração da constante Pi, escolh declará globalmente por ser utilizável nas funções trigono métricas (Math.sin(), por exemplo), uma vez que as funçoes trigonométricas em JS são calculadas em radianos e por isso essa const foi criada para tranformar em graus.
const pi = Math.PI



// Essa função definirá qual Modelo de cálculo da NBR 6118 será utilizado, sendo que será adotado o angulo conforme o modelo. Nesta função resolvi fazer uma teste lógico de quem seria o menor valor ligando a escolha na page html com o valor do ângulo. Como irá retornar o menor ângulo, ou será 45 deg (já do modelo1 e valor inicialmente fixado no modelo2), caso seja menor que 45 saberá que é o modelo2.
function escolheModelo(){
	var valor, v1, v2
	
	if (document.getElementById("modelo1").checked == true) {
		valor = 45
	}else{
		valor = document.getElementById("modelo2").value
	}
	
	calcular(valor)
	
}


// Função principal, captura variáveis e realiza os cálculos principais. Ele posteriormente envia para as funções sequentes dados principais (para as funções de Armadras Normal e Mínima, respectivamente, conforme o caso compreendido).
function calcular(valor){

	var cortante = document.getElementById('cortante').value
	var fck = document.getElementById('fck').value
	var b = document.getElementById('bw').value / 100
	var d = document.getElementById('d').value / 100


	var vsd = cortante * 1.4
	var fcd = (fck * 1000000)/1.4

	var ah = (1 - (fck/250))
	
	//variável do ângulo sendo convertida de rad em deg
	var teta = valor * (pi/180)
	//variável criada para substituir a operação com cotangentes cotg(alfa)+cotg(beta), facilitando todo o resto de cálculos posteriores
	var operacaoCotg = (1/Math.tan(teta))
	//operação geral para o cáclculo da Cortante Resistente
	var vrd2 = (0.54 * ah * fcd * b * d * Math.sin(teta) * Math.sin(teta) * operacaoCotg) / 1000

	//operação para cálculo da Cortante Resistente (caso Modelo I) - não é necessário ativar a linha, uma vez que o caso acima englobará todos os casos possíveis, tanto modelo i como II.
	//var vrd2 = (0.27 * ah * fcd * b * d)/1000  --- continuar comentada


	//Verificação da Biela (Primeiro teste para verificar a possibilidade dos cálculos)
	if (vrd2 >= vsd) {

		//Vc = Vc0 - primeiro valor de Vc que será testado depois, se for necessário aplicar armadura mínima.
		var vc = (0.09 * Math.pow((fck), (2/3)) * (b*1000) * (d*1000))/1000
		
		//verifica se Vsw é negativo baseado no valor de Vc = Vc0 encontrado
		if (vrd2 >= vc) {

			//Vc = Vc1 - segundo valor de Vc, depois de verificado um Vsw positivo, Vc será Vc1 (Vc = Vc1). Novamente o novo Vc será testado para verificar se um novo Vsw continuará positivo, se positivo proseguirá para a Armadura Comum, caso negativo seguirá para Armadura Mínima.
			vc = (vc * ((vrd2 - vsd)/(vrd2 - vc)))

			//verifica se Vsw é negativo baseado no valor de Vc = Vc1 encontrado
			if (vrd2 >= vc) {

				var vsw = vsd - vc

				if (vsw > 0) {
					//Vsw positivo - cálculo normal
					armaduraNormal(vsd, vrd2, vc, vsw, b, d, teta)
				}else{
					//vsw negativo - cálculo para armadura mínima
					armaduraMinima(vsd, vrd2, vc, vsw, b, d, fck)
				}
				
			}else{
				armaduraMinima(vsd, vrd2, vc, vsw, b, d, fck)
			}


		}else{
			armaduraMinima(vsd, vrd2, vc, vsw, b, d, fck)
		}

	}else{
		//caso em que a Biela não suporta a cortante gerada, o concreto soferá ruptura por compressão em diagonal, essa situação não pode acontecer de maneira nenhuma. Por isso, em alguns casos, clacula-se a verificação da biela antes mesmo do cálculo das "Armaduras Longitudinais".
		alert("Não é possível calcular, a biela não passa na verificação!!!")
	}
}

// Função para calcular a Armadura Transversal quando Vsw for positivo, situação normal de cálculo para descobrir a área de aço baseado na cortante gerada.
function armaduraNormal(vsd, vrd2, vc, vsw, b, d, teta){

	var areaAco = ((vsw * 1000) / (0.9 * d * (500*1000000/1.15) * (1 / Math.tan(teta)) ) ) * 1000000

	//var areaAco = ((vsw * 1000) / (0.9 * d * (500*1000000/1.15))) * 1000000

	var condicao = 'Cálculo para Armadura Normal'

	mostrarValores(vsd, vrd2, vc, vsw, areaAco, condicao)
}

// Função para calcular a Armadura Transversal quando Vsw for negativo, situação de cálculo para os casos não necessários de cortante, aplicando-se uma área de aço mínima básica para evitar fissurações e outros decorrentes.
function armaduraMinima(vsd, vrd2, vc, vsw, b, d, fck){

// Valores para p(rõ) - densidade de aço no concreto. Preferiu-se produzir uma sequência de seleção em vez de vetor pela facilidade e rapidez, em via do conhecimento desse programador ('rssrsrsrrsrs- risos meus :D). Mas futuramente pode ser aplicado um conceito melhor.
	var p
	if (fck == 20) {
		p = 0.089
	}
	if ((fck > 20) && (fck <= 25)) {
		p = 0.102
	}
	if ((fck > 25) && (fck <= 30)) {
		p = 0.116
	}
	if ((fck > 30) && (fck <= 35)) {
		p = 0.129
	}
	if ((fck > 35) && (fck <= 40)) {
		p = 0.141
	}
	if ((fck > 40) && (fck <= 45)) {
		p = 0.152
	}
	if ((fck > 45) && (fck <= 50)) {
		p = 0.163
	}

	areaAco = (b * p) * 1000 

	var condicao = 'Cálculo para Armadura Mínima'

	mostrarValores(vsd, vrd2, vc, vsw, areaAco, condicao)
}

// Função para exibir os valoresproduzidos na tela do usuário, retorna os valores requeridos para quem utliza o App EngTool.
function mostrarValores(vsd, vrd2, vc, vsw, areaAco, condicao){
	document.getElementById("vsd").innerHTML = vsd
	document.getElementById("vrd2").innerHTML = vrd2
	document.getElementById("vc").innerHTML = vc
	document.getElementById("vsw").innerHTML = vsw
	document.getElementById("tipoDeCalculo").innerHTML = condicao

	document.getElementById("areaAcoTrans").innerHTML = areaAco
}


//--------------------------------------------------------------------------------------------------------------------------------------------
// Essa é uma função de controle para o tipo de Modelo escolhido no início da página. Essa função não permite que o usuário insira um valor, no Modelo II, de teta < 30deg e teta > 45deg. Toda vez que o valor é alterado uma mensagem é enviada ao usuário pedindo a correção e recorrendo o valor de teta-inicial como 45 graus.
function verificaMdl(){
	var theta = document.getElementById("modelo2").value
	if ((theta < 30) || (theta > 45)) {
	alert("Por favor, insira um valor entre 30 e 45 graus, conforme o Modelo II determinado na NBR 6118/14.")
	document.getElementById("modelo2").value = 45
	}
}


// Função para verficar se todos os dados foram devidamente inseridos
function verificar(){
	if (document.getElementById("cortante").value == '' || document.getElementById("fck").value == '' || document.getElementById("bw").value == '' || document.getElementById("d").value =='' ) {
		alert("Por favor, insira todos os dados necessários!")
	}
}





// Função de Controle e Retorno - melhor amiga na hora de construir esse programa ('uufaaaa, deu um trabalhinho ~~~<3 by A^3.)
function retorno(){
	alert("OIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIi")
}