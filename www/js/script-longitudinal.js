


//função-teste (utilizada para quando haver problemas de verificação e correção de código)
function mensagem(){
	alert("Oiiiiiiiiiiiiiiiii")
}


//função que verifica se os espaços de entradas de dados estão vazios ou não, se vazios impede a continuação do cálculo, seão, prossegue com a função para calcular.
function verificar(){
	if (document.getElementById("momento-fletor").value == '' || document.getElementById("fck").value == '' || document.getElementById("bw").value == '' || document.getElementById("h").value == '' || document.getElementById("d").value =='' ) {
		alert("Por favor, insira todos os dados necessários!")
	}else{
		calcular()
	}
}

//função calcula os coefcientes kmd, kx, determina o domínio do ELU do concreto  com as dimensões estabelecidas, corrige quando necessário (Domínio 2-a, segundo Teattini) e repassa os valores para a função que calculará a área de aço.
function calcular(){
	//variáveis usadas mais a frente para correção (Domínio 2-a), se necessário.
	var deformConcreto
	var tensaoConcreto
	//variável para o dmínio do concreto.
	var dominio
	//variáveis globais.
	var md = document.getElementById("momento-fletor").value * 1.4
	var fck = document.getElementById("fck").value
	var b = document.getElementById("bw").value / 100
	var h = document.getElementById("h").value
	var d = document.getElementById("d").value / 100
	
	//cálculo dos coeficientes K, adimensionais.
	var kmd = ((md * 1000)/((b * d*d * 0.85 * fck * 1000000)/1.4))

	var kx = (1 - Math.sqrt(1 - 2*kmd))/ (0.8) 
	
	//variável para condizer qual a próxima situação de cálculo a ser tomada, condicionei| 0-nãopode ser calculado| 1-pode ser calculado, mas precisará passar pela correção| 2-pode ser calculado, sem necessidade de correção.| Ela é verificada no final dessa função para permitir ou não a continuação do código.
	var condicao = 2 

	//domínio 1.
	if (kx < 0) {
		condicao = 0
		dominio = 'Domínio 1'
	}
	//domínio 2 generalizado.
	if (kx > 0 && kx < 0.259) {
		//deformação do concreto
		deformConcreto = (kx/(1-kx)) * 10

		//domínio 2-b, sem necessidade de correção.
		if (deformConcreto > 2) {
			condicao = 2
			dominio = 'Domínio 2B - Sem necessidade de correção'
		}
		//domínio 2-b, sem necessidade de correção.
		else{
			condicao = 2
			tensaoConcreto = ((0.85 * fck * 1000000 / 1.4) * (1- Math.pow((1-(deformConcreto/2)),2)))
			kmd = ((md * 1000)/(b * d * d * tensaoConcreto))
			kx = (1 - Math.sqrt(1 - 2*kmd))/ (0.8)
			condicao = 2
			dominio = 'Domínio 2A - Com necessidade de correção'
		}
	
	}
	//domínio 3, com ductibilidade (segundo a norma Kx < 0,45).
	if (kx > 0.259 && kx < 0.45) {
		condicao = 2
		dominio = 'Domínio 3 - Com Ductibilidade'
	}
	//domínio 3, sem ductibilidade (segundo a norma Kx > 0,45).
	if (kx > 0.45 && kx < 0.63) {
		condicao = 2
		dominio = 'Domínio 3 - Sem Ductibilidade'
	}
	//domínio 4, concreto super-armada.
	if (kx > 0.63 && kx < 1) {
		condicao = 1
		dominio = 'Domínio 4'
	}
	
	//seção onde as condições são analisadas, conforme referido na variável condicao, de acordo com as condições de cálculo disponibilizadas no ELU do Concreto Armado referidas na norma NBR 6118/14. Aqui as condições são testadas e os cálculos redirecionados.
	switch (condicao){
		case 0:
			alert("Não é possível calcular uma armadura com esses valores em acordo com a ABNT NBR-6118/2014")
			mostrarDominio(dominio)
			break
		case 1:
			alert("A viga se encontra super-armada com essas dimensões. Nessas condições, recomenda-se aplicação de Armadura Dupla ou Vigas - T, conforme a NBR 6118/14.")
			mostrarDominio(dominio)
			break
		case 2:
			//prossegue com o cálculo das armaduras 
			calculoArea(md,b,h,d,kmd,kx,dominio)
			break
	}
}

//fução particular para o cálculo da armadura. Nessa função é cálculado primeiramente o Kz para depois adentrar na Área de Aço transversal. Preferiu-se deixar uma função específica para o coeficiente do braço de alavanca por este se utilizado somente para encontrar As, e facilitando o entendimento para a sequencia se a viga cairá ou não no domínio 2-a e igualmente se será aplicado a correção na tensão de compressão do concreto.
function calculoArea(md,b,h,d,kmd,kx,dominio){
	//cálculo do Kz
	var kz = 1 - 0.4 * kx
	//cálculo da Área de Aço
	var as
	as = ((md * 1000)/(kz * d * (500) / 1.15))
	//cálculo da Área de Aço Sobre-Apoios
	var asp
	asp = (as/3)
	//verificação e cálculo da armadura de pele, caso seja necessário.
	var ap
	ap = 0
	if (h >= 60) {
		var areaSecao
		areaSecao = (b * h)
		ap = ((0.1 / 100) * areaSecao)
	}

	//envia os valores necessários para a função de modificação da página.
	retornaValores(md,kmd,kx,kz,as,asp,ap,dominio)
	mostrarDominio(dominio)
}

//função responsável por capturar os valores necessários que o usuário precisa, e 'escreve-los' na página de forma sequenciada.
function retornaValores(md,kmd,kx,kz,as,asp,ap,dominio){
	document.getElementById("momento-projeto").innerHTML = md
	document.getElementById("dominio").innerHTML = dominio
	document.getElementById("kmd").innerHTML = kmd
	document.getElementById("kx").innerHTML = kx
	document.getElementById("kz").innerHTML = kz
	document.getElementById("areaAco").innerHTML = as
	document.getElementById("areaAcoSP").innerHTML = asp
	document.getElementById("areaAcoP").innerHTML = ap

	
}

function mostrarDominio(dominio){
	switch (dominio){
		case ('Domínio 1'):
			document.getElementById("imgDominio").src = "img/dominios1.jpg"
			break;
		case ('Domínio 2A - Com necessidade de correção'):
			document.getElementById("imgDominio").src = "img/dominios2a.jpg"
			break;
		case ('Domínio 2B - Sem necessidade de correção'):
			document.getElementById("imgDominio").src = "img/dominios2b.jpg"
			break;
		case ('Domínio 3 - Com Ductibilidade'):
			document.getElementById("imgDominio").src = "img/dominios3a.jpg"
			break;
		case ('Domínio 3 - Sem Ductibilidade'):
			document.getElementById("imgDominio").src = "img/dominios3b.jpg"
			break;
		case ('Domínio 4')://nunca vai entrar no fluxo - corrija--------------------------------------------------------------CORRIGIDO!!!!
			document.getElementById("imgDominio").src = "img/dominios4.jpg"
			break;
	}
}

function info(){
	alert("EngTool - Cálculo de Armaduras\n   Seção Retangular \n   version b0.1 \nA^3.")
}