/*
The portuguese translations.

@private
*/
vdf.lang.translations_pt = {
    error : {
        5129 : "Referência ao objeto form requerida em '{{0}}'",
        5130 : "Biblioteca inválida: '{{0}}'",
        5131 : "O Listener de evento deve ser uma função (evento: '{{0}}')",
        5132 : "O nome de controle '{{0}}' já existe dentro do form '{{1}}'",
        5133 : "O controle deve ter um nome",
        5134 : "Não foi possível encontrar o método de inicialização '{{0}}'",
        5135 : 'Tipo de controle desconhecido (vdfControlType="{{0}}")',
        5136 : "Campo não indexado para pesquisas",
        5137 : "Tabela desconhecida '{{0}}'",
        5138 : "Campo '{{0}}' desconhecido na tabela '{{1}}'",

        5139 : "Linha Edit requerida para a grid",
        5140 : "Tipo de linha desconhecido: {{0}}",
        5141 : "Tab container sem um botão: {{0}}",
        5142 : "Botão Tab sem um container: {{0}}",
        5143 : "A propriedade '{{0}}' é requerida",
        5144 : "A tabela Server é requerida em um Form com campos",
        5145 : "Conexão de dados (Data Binding) desconhecida '{{0}}'",
        5146 : "Não há objeto de entrada de dados ativo para realizar a operação",
        5147 : "O campo '{{0}}' não está indexado",	
        5148 : "O campo '{{0}}' não faz parte da tabela principal",
        5149 : "HTML inválido para o controle, não foi possível encontrar o elemento '{{0}}'",
        5150 : "Não foi possível encontrar submenu '{{0}}'",
        5151 : "O nó ID '{{0}}' não é único na estrutura",

        5124 : "O Campo requer pesquisa",
        5125 : "O valor não satisfaz uma das opções",
        5126 : "O valor deve ser menor que '{{0}}'",
        5127 : "O valor deve ser maior que '{{0}}'",
        5128 : "Valor requerido",

        5152 : "Não foi possível encontrar o nó de resposta no XML de resposta",
        5123 : "Erro desconhecido ao analisar (parse) o XML de resposta",
        5120 : "Erro HTTP '{{0}}' ocorreu durante a requisição",
        5121 : "O WebService retornou erro soap '{{0}}'",
        5122 : "Erro durante a análise (parse) do XML de resposta",

        titleServer : "Erro {{0}} ocorreu no servidor!",
        title : "Erro {{0}}!"
    },
    
    list : {
        search_title : "Pesquisar..",
        search_value : "Pesquisar valor",
        search_column : "Coluna",
        search : "Pesquisar",
        cancel : "Cancelar"
    },
    
    lookupdialog : {
        title : "Listagem",
        select : "Selecionar",
        cancel : "Cancelar",
        search : "Pesquisar",
        lookup : "Lookup"
    },
    
    calendar : {
        today : "Hoje é",
        wk : "S",
        daysShort : ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"],
        daysLong : ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
        monthsShort : ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
        monthsLong : ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
    },
    
    global : {
        ok : "OK",
        cancel : "Cancelar"
    }
};
vdf.register("vdf.lang.translations_pt");