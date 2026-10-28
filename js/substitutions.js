export const FAMILIAS = [
  {
    id: "quadriceps-agachamento-livre",
    musculo: "Quadríceps + Glúteo Máximo",
    padrao: "Dominante de Joelho (Agachamento Bilateral Profundo)",
    membros: [
      {
        nome: "Agachamento livre profundo",
        alias: ["agachamento livre profundo", "agachamento livre", "agachamento costas", "back squat", "agachamento com barra"],
        obs: "Excelente recrutamento global de quadríceps e glúteo. Exige alta estabilização de tronco (core) e boa mobilidade de tornozelo e quadril."
      },
      {
        nome: "Agachamento no Smith",
        alias: ["agachamento no smith", "agachamento smith", "smith squat"],
        obs: "Maior estabilidade guiada, permitindo foco total na extensão de joelhos e falha muscular sem risco de perda de equilíbrio."
      },
      {
        nome: "Agachamento Hack (Hack Squat)",
        alias: ["agachamento hack", "hack squat", "hack machine"],
        obs: "Excelente para enfatizar quadríceps com tronco apoiado. Permite grande amplitude profunda reduzindo estresse na coluna vertebral."
      },
      {
        nome: "Pendulum Squat",
        alias: ["pendulum squat", "agachamento pendulo"],
        obs: "Acompanha a curva de força natural do quadríceps, proporcionando um alongamento biomecânico profundo na posição inferior."
      },
      {
        nome: "Agachamento frontal (Front Squat)",
        alias: ["agachamento frontal", "front squat"],
        obs: "Tronco mais verticalizado, o que aumenta a sobrecarga nos quadríceps e reduz o torque e compressão na região lombar."
      },
      {
        nome: "Leg Press 45° (pés baixos na plataforma)",
        alias: ["leg press 45", "leg press", "leg press pesado"],
        obs: "Com os pés mais baixos na plataforma, foca a flexão do joelho e o quadríceps, eliminando a demanda de estabilização do tronco."
      }
    ],
    tambem: ["Agachamento Búlgaro", "Leg Press 45°"]
  },
  {
    id: "quadriceps-gluteo-unilateral",
    musculo: "Quadríceps + Glúteo Máximo (Unilateral)",
    padrao: "Dominante de Joelho Unilateral (Lunge / Split Squat)",
    membros: [
      {
        nome: "Afundo no Smith (passo longo, descida profunda)",
        alias: ["afundo no smith", "afundo smith", "afundo no smith passo longo", "lunge no smith"],
        obs: "Passo longo e descida profunda aumentam a amplitude de estiramento do glúteo máximo da perna da frente, com extrema estabilidade pela barra guiada."
      },
      {
        nome: "Agachamento Búlgaro (Bulgarian Split Squat)",
        alias: ["agachamento bulgaro", "bulgaro", "bulgaro com halter", "bulgaro no smith"],
        obs: "Isola a perna anterior e oferece altíssimo estresse mecânico em posição de alongamento do glúteo e quadríceps."
      },
      {
        nome: "Afundo com halteres / barra livre",
        alias: ["afundo com halteres", "afundo livre", "afundo com barra", "lunge com halteres"],
        obs: "Trabalha estabilidade dinâmica, propriocepção e controle de joelho/quadril em cadeia cinética fechada."
      },
      {
        nome: "Passada caminhando com halteres",
        alias: ["passada", "passada com halteres", "passada caminhando", "walking lunge"],
        obs: "Excelente componente de força dinâmica e condicionamento, exigindo equilíbrio e coordenação contínua."
      },
      {
        nome: "Step-up (Subida no caixa/banco com carga)",
        alias: ["step up", "subida no banco", "step up com halteres"],
        obs: "Foco na extensão de quadril e joelho unilateral partindo de uma posição neutra, reduzindo impulso da perna oposta."
      }
    ],
    tambem: ["Agachamento Hack", "Leg Press Unilateral"]
  },
  {
    id: "gluteo-extensao-quadril",
    musculo: "Glúteo Máximo",
    padrao: "Extensão de Quadril com Joelhos Fletidos (Hip Thrust)",
    membros: [
      {
        nome: "Elevação pélvica pesada com barra",
        alias: ["elevacao pelvica pesada", "elevacao pelvica", "hip thrust", "elevacao pelvica com barra"],
        obs: "Exercício com maior pico de tensão no glúteo máximo na posição de encurtamento total. Baixo estresse na coluna lombar."
      },
      {
        nome: "Elevação pélvica na máquina",
        alias: ["elevacao pelvica na maquina", "hip thrust machine", "elevacao pelvica articulada"],
        obs: "Facilita o setup, elimina a dificuldade de posicionar a barra pesada e mantém a tensão direcionada ao glúteo."
      },
      {
        nome: "Elevação pélvica unilateral",
        alias: ["elevacao pelvica unilateral", "hip thrust unilateral", "elevacao pelvica com pausa"],
        obs: "Ideal para corrigir assimetrias de força e trabalhar o controle muscular com foco em pico de contração."
      },
      {
        nome: "Glute Bridge no banco/chão com carga",
        alias: ["glute bridge", "ponte de gluteo", "ponte sobre os ombros"],
        obs: "Amplitude ligeiramente reduzida em comparação ao Hip Thrust, focando puramente no bloqueio e contração máxima do glúteo."
      }
    ],
    tambem: ["Hiperextensão 45° com foco em glúteo"]
  },
  {
    id: "quadriceps-isolador",
    musculo: "Quadríceps",
    padrao: "Extensão Isolada de Joelho",
    membros: [
      {
        nome: "Cadeira extensora",
        alias: ["cadeira extensora", "extensora", "leg extension"],
        obs: "Único exercício que isola o Reto Femoral ao promover extensão pura de joelho com o quadril fletido. Permite atingir a falha em segurança."
      },
      {
        nome: "Sissy Squat",
        alias: ["sissy squat", "agachamento sissy"],
        obs: "Promove um alongamento extremo da porção anterior do quadríceps sob tensão mecânica corporal."
      },
      {
        nome: "Extensão de joelho unilateral na polia",
        alias: ["extensora na polia", "extensora unilateral"],
        obs: "Mantém a tensão constante ao longo de toda a amplitude do movimento."
      }
    ],
    tambem: ["Agachamento Hack com pés baixos"]
  },
  {
    id: "gluteo-abducao",
    musculo: "Glúteo Médio e Glúteo Mínimo",
    padrao: "Abdução de Quadril",
    membros: [
      {
        nome: "Cadeira abdutora",
        alias: ["cadeira abdutora", "abdutora", "abducao na maquina", "hip abduction machine"],
        obs: "Estabilidade total para isolar a porção súpero-lateral do glúteo sem compensação do tronco."
      },
      {
        nome: "Abdução de quadril na polia",
        alias: ["abducao na polia", "abducao de quadril na polia", "abducao cabo"],
        obs: "Variação contínua de vetor de força, mantendo o glúteo médio sob tensão mesmo na fase inicial do movimento."
      },
      {
        nome: "Elevação lateral de perna em decúbito lateral / Clamshell",
        alias: ["abducao com elastico", "abducao no solo", "clamshell"],
        obs: "Excelente para ativação, estabilização articular do quadril e pré-exaustão."
      }
    ],
    tambem: []
  },
  {
    id: "posterior-cadeia-posterior-alongamento",
    musculo: "Isquiotibiais + Glúteo Máximo",
    padrao: "Extensão de Quadril com Joelhos Semiflexos (Hip Hinge)",
    membros: [
      {
        nome: "Stiff (com barra ou halteres)",
        alias: ["stiff", "stiff com barra", "stiff com halteres", "rumanian deadlift", "rdl"],
        obs: "Excelente exercício para focar a hipertrofia por alongamento dos isquiotibiais e porção inferior do glúteo."
      },
      {
        nome: "RDL (Romanian Deadlift)",
        alias: ["romanian deadlift", "rdl com barra", "rdl com halteres"],
        obs: "Foco total no deslocamento posterior do quadril com mínima flexão de joelhos."
      },
      {
        nome: "Stiff unilateral (Single-leg RDL)",
        alias: ["stiff unilateral", "rdl unilateral", "stiff 1 perna"],
        obs: "Ótimo para corrigir assimetrias corporais, desafiando a estabilização dos adutores e glúteo médio."
      },
      {
        nome: "Hiperextensão 45°",
        alias: ["hiperextensao 45", "banco 45 posterior", "back extension 45"],
        obs: "Trabalha a extensão de quadril reduzindo consideravelmente a compressão axial sobre a coluna lombar."
      }
    ],
    tambem: ["Levantamento Terra Hexagonal"]
  },
  {
    id: "posterior-flexao-joelho-isolador",
    musculo: "Isquiotibiais",
    padrao: "Flexão Isolada de Joelho",
    membros: [
      {
        nome: "Cadeira flexora",
        alias: ["cadeira flexora", "flexora sentada", "seated leg curl"],
        obs: "Com o quadril fletido a 90°, coloca os isquiotibiais em posição de pré-alongamento."
      },
      {
        nome: "Mesa flexora deitada",
        alias: ["mesa flexora", "flexora deitada", "lying leg curl"],
        obs: "Trabalha a flexão de joelho com quadril neutro, alterando a curva de tensão ao longo do movimento."
      },
      {
        nome: "Flexora em pé unilateral",
        alias: ["flexora em pe", "flexora unilateral em pe", "standing leg curl"],
        obs: "Permite focar isoladamente na flexão de cada perna sem compensações pélvicas."
      },
      {
        nome: "Nordic Hamstring Curl",
        alias: ["nordic curl", "flexao nordica", "nordic hamstring"],
        obs: "Exercício excêntrico de alta intensidade, extremamente eficaz na prevenção de lesões."
      }
    ],
    tambem: ["Stiff"]
  },
  {
    id: "gluteo-adutores-sumo",
    musculo: "Glúteo Máximo, Adutor Magno e Quadríceps",
    padrao: "Agachamento com Base Larga (Sumô)",
    membros: [
      {
        nome: "Agachamento sumô profundo",
        alias: ["agachamento sumo profundo", "agachamento sumo", "sumo squat", "agachamento sumo com halter"],
        obs: "A rotação externa de quadril e base larga recrutam intensamente os adutores e a porção inferior do glúteo máximo."
      },
      {
        nome: "Agachamento sumô no Smith",
        alias: ["agachamento sumo no smith", "sumo smith"],
        obs: "Permite focar o vetor de força verticalizado sem comprometer o equilíbrio lateral."
      },
      {
        nome: "Agachamento Cossaco (Cossack Squat)",
        alias: ["cossack squat", "agachamento cossaco"],
        obs: "Trabalha mobilidade e força de adutores e quadríceps no plano frontal."
      },
      {
        nome: "Cadeira Adutora",
        alias: ["cadeira adutora", "adutora", "aducao na maquina"],
        obs: "Isolamento direto para o adutor magno e longo com controle total da carga."
      }
    ],
    tambem: ["Leg Press com base larga"]
  },
  {
    id: "costas-puxada-alta-foco-dorsal",
    musculo: "Grande Dorsal, Redondo Maior, Bíceps Braquial",
    padrao: "Puxada Vertical",
    membros: [
      {
        nome: "Puxada alta, pegada firme e controlada",
        alias: ["puxada alta pegada firme e controlada", "puxada alta", "puxada frontal", "lat pulldown"],
        obs: "Controle da fase excêntrica e foco na adução de escápulas para máximo recrutamento do grande dorsal."
      },
      {
        nome: "Puxada com pegada neutra / triângulo",
        alias: ["puxada neutra", "puxada neutra ou pronada", "puxada com triangulo", "puxada fechada"],
        obs: "Posição articular mais anatômica e confortável para o ombro, permitindo maior braço de alavanca."
      },
      {
        nome: "Puxada supinada",
        alias: ["puxada supinada", "puxada pegada invertida"],
        obs: "Aumenta a participação da cabeça longa do bíceps sem perder a amplitude vertical."
      },
      {
        nome: "Barra fixa (Pull-up / Chin-up)",
        alias: ["barra fixa", "pull up", "chin up"],
        obs: "Trabalha a estabilização ativa de todo o core e cintura escapular sob o peso corporal."
      },
      {
        nome: "Puxada articulada em máquina",
        alias: ["puxada articulada", "puxada na maquina", "puxada articulada maquina"],
        obs: "Trajetória convergente natural que se adapta à anatomia das fibras da dorsal."
      }
    ],
    tambem: ["Pulldown com braço reto"]
  },
  {
    id: "costas-remada-sentada-polia",
    musculo: "Costas Médias",
    padrao: "Remada Horizontal na Polia",
    membros: [
      {
        nome: "Remada sentada na polia",
        alias: ["remada sentada na polia", "remada baixa sentada", "remada na polia", "cable row"],
        obs: "Tensão constante do cabo do início ao fim do movimento, ideal para retração escapular ativa."
      },
      {
        nome: "Remada articulada com peito apoiado",
        alias: ["remada articulada", "remada maquina", "remada com peito apoiado"],
        obs: "Elimina a participação da lombar, permitindo focar 100% no esmagamento muscular."
      },
      {
        nome: "Remada curvada com barra / halteres",
        alias: ["remada curvada", "remada curvada ou maquina de remada", "remada curvada com barra"],
        obs: "Exercício composto de alta demanda estrutural que constrói espessura nas costas."
      },
      {
        nome: "Remada Cavalinho (T-Bar Row)",
        alias: ["remada cavalinho", "t-bar row", "cavalinho"],
        obs: "Excelente para aplicação de cargas elevadas no plano horizontal."
      }
    ],
    tambem: ["Remada Unilateral"]
  },
  {
    id: "costas-remada-unilateral-foco",
    musculo: "Grande Dorsal e Romboides",
    padrao: "Remada Unilateral",
    membros: [
      {
        nome: "Remada unilateral (Serrote com halter)",
        alias: ["remada unilateral", "remada serrote", "serrote", "remada unilateral com halter"],
        obs: "Permite maior amplitude de movimento e previne assimetrias."
      },
      {
        nome: "Remada unilateral na polia baixa",
        alias: ["remada unilateral na polia", "remada unilateral polia"],
        obs: "Direciona o vetor de tensão alinhado com as fibras inferiores da dorsal."
      },
      {
        nome: "Remada unilateral articulada na máquina",
        alias: ["remada unilateral na maquina", "remada articulada unilateral"],
        obs: "Movimento totalmente guiado que possibilita treinar até a falha com segurança."
      }
    ],
    tambem: ["Remada sentada na polia"]
  },
  {
    id: "costas-pulldown-isolador",
    musculo: "Grande Dorsal",
    padrao: "Extensão de Ombro com Cotovelo Estendido",
    membros: [
      {
        nome: "Pulldown com braço reto",
        alias: ["pulldown com braco reto", "pulldown", "pulldown na polia", "straight arm pulldown"],
        obs: "Isola a grande dorsal ao remover o bíceps da jogada; excelente para conexão mente-músculo."
      },
      {
        nome: "Pullover na polia com corda ou barra reta",
        alias: ["pullover na polia", "pullover corda"],
        obs: "Proporciona tensão uniforme ao longo da posição de alongamento superior."
      },
      {
        nome: "Pullover com halter no banco",
        alias: ["pullover com halter", "pullover halter"],
        obs: "Trabalha o alongamento da caixa torácica e grande dorsal."
      },
      {
        nome: "Pullover em máquina específica",
        alias: ["pullover em maquina", "pullover machine"],
        obs: "Mantém a tensão contínua até o ponto de contração máxima."
      }
    ],
    tambem: ["Puxada alta"]
  },
  {
    id: "deltoide-posterior-isolador",
    musculo: "Deltoide Posterior",
    padrao: "Abdução Horizontal de Ombro",
    membros: [
      {
        nome: "Crucifixo inverso (com halteres)",
        alias: ["crucifixo inverso", "crucifixo inverso halteres", "reverse fly"],
        obs: "Isola o deltoide posterior no plano horizontal; requer controle para evitar predominância do trapézio."
      },
      {
        nome: "Voador invertido (Peck Deck Inverso)",
        alias: ["voador invertido", "reverse peck deck", "peck deck inverso"],
        obs: "Trajetória fixa que estabiliza as articulações e isola a porção posterior com perfeição."
      },
      {
        nome: "Crucifixo inverso na polia (cabos cruzados)",
        alias: ["crucifixo inverso na polia", "crucifixo inverso polia", "cable reverse fly"],
        obs: "Mantém a tensão constante no deltoide posterior mesmo no início do movimento."
      },
      {
        nome: "Face Pull com corda na polia alta",
        alias: ["face pull", "facepull", "face pull com corda"],
        obs: "Trabalha a abdução horizontal combinada com rotação externa de ombro."
      }
    ],
    tambem: ["Remada alta com pegada aberta"]
  },
  {
    id: "deltoide-lateral-isolador",
    musculo: "Deltoide Lateral",
    padrao: "Abdução no Plano Escapular",
    membros: [
      {
        nome: "Elevação lateral com halteres",
        alias: ["elevacao lateral", "elevacao lateral com halteres", "lateral raise"],
        obs: "O construtor clássico de largura de ombros. Deve ser executado levemente à frente."
      },
      {
        nome: "Elevação lateral na polia (unilateral)",
        alias: ["elevacao lateral na polia", "elevacao lateral polia", "cable lateral raise"],
        obs: "Mantém tensão contínua no deltoide lateral no ponto de maior alongamento."
      },
      {
        nome: "Elevação lateral na máquina",
        alias: ["elevacao lateral na maquina", "lateral raise machine"],
        obs: "Reduz o momento de inércia nos punhos e cotovelos."
      },
      {
        nome: "Elevação lateral deitado no banco inclinado",
        alias: ["elevacao lateral banco inclinado", "elevacao lateral deitado"],
        obs: "Altera o pico de tensão da gravidade para o início do movimento."
      }
    ],
    tambem: ["Desenvolvimento com halteres"]
  },
  {
    id: "peito-press-horizontal-supino",
    musculo: "Peitoral Maior, Deltoide Anterior, Tríceps Braquial",
    padrao: "Press Horizontal Bilateral",
    membros: [
      {
        nome: "Supino reto (com barra ou halteres)",
        alias: ["supino reto", "supino reto com barra", "bench press", "supino reto halteres"],
        obs: "Exercício base de empurrar no plano horizontal para volume e força de peitoral maior."
      },
      {
        nome: "Chest press (máquina de supino reto)",
        alias: ["chest press", "supino reto na maquina", "supino articulado"],
        obs: "Permite levar o peitoral à falha extrema sem o risco articular de perder o controle."
      },
      {
        nome: "Supino reto no Smith",
        alias: ["supino reto no smith", "supino smith"],
        obs: "Trajetória reta ideal para aplicação de métodos avançados de intensidade."
      },
      {
        nome: "Flexão de braço (com peso / paralela)",
        alias: ["flexao de braco", "push up", "flexao"],
        obs: "Movimento em cadeia cinética fechada com livre movimentação das escápulas."
      }
    ],
    tambem: ["Supino inclinado com halteres", "Crossover na polia"]
  },
  {
    id: "deltoide-anterior-desenvolvimento",
    musculo: "Deltoide Anterior, Tríceps Braquial, Peitoral Superior",
    padrao: "Press Vertical de Ombros",
    membros: [
      {
        nome: "Desenvolvimento com halteres",
        alias: ["desenvolvimento com halteres", "desenvolvimento halteres", "dumbbell shoulder press", "desenvolvimento"],
        obs: "Excelente amplitude articular, permitindo rotação natural do ombro durante a subida."
      },
      {
        nome: "Desenvolvimento em máquina / articulado",
        alias: ["desenvolvimento em maquina", "desenvolvimento maquina", "machine shoulder press"],
        obs: "Reduz a exigência de estabilização, direcionando o estresse puramente na cabeça anterior."
      },
      {
        nome: "Desenvolvimento no Smith",
        alias: ["desenvolvimento no smith", "desenvolvimento smith"],
        obs: "Fornece um trilho fixo seguro para cargas elevadas acima da cabeça."
      },
      {
        nome: "Desenvolvimento militar com barra",
        alias: ["desenvolvimento militar", "overhead press", "ohp", "desenvolvimento com barra em pe"],
        obs: "Construtor funcional de força de ombro e estabilidade do tronco."
      },
      {
        nome: "Arnold Press com halteres",
        alias: ["arnold press", "desenvolvimento arnold"],
        obs: "A rotação ao longo da subida estende o recrutamento do deltoide anterior para o lateral."
      }
    ],
    tambem: ["Elevação lateral"]
  },
  {
    id: "biceps-flexao-cotovelo",
    musculo: "Bíceps Braquial, Braquial, Braquiorradial",
    padrao: "Flexão de Cotovelo",
    membros: [
      {
        nome: "Rosca direta na polia",
        alias: ["rosca direta na polia", "rosca direta polia", "cable bicep curl"],
        obs: "Tensão constante fornecida pelo cabo durante a flexão e a extensão."
      },
      {
        nome: "Rosca direta com barra W / barra reta",
        alias: ["rosca direta com barra w", "rosca direta", "rosca direta barra reta", "barbell curl"],
        obs: "Exercício fundamental para o acúmulo de carga na flexão de cotovelo."
      },
      {
        nome: "Rosca alternada com halteres",
        alias: ["rosca alternada", "rosca com halteres", "dumbbell curl"],
        obs: "Permite a supinação completa do antebraço durante o movimento."
      },
      {
        nome: "Rosca Scott (máquina ou banco)",
        alias: ["rosca scott", "scott curl", "rosca scott maquina"],
        obs: "Fixa o braço à frente do corpo, eliminando impulsos do ombro."
      },
      {
        nome: "Rosca inclinada com halteres (no banco 45°)",
        alias: ["rosca inclinada", "rosca inclinada com halteres", "incline dumbbell curl"],
        obs: "Posiciona o ombro em extensão, pré-alongando a cabeça longa do bíceps."
      }
    ],
    tambem: ["Rosca Martelo"]
  },
  {
    id: "triceps-extensao-cotovelo",
    musculo: "Tríceps Braquial",
    padrao: "Extensão de Cotovelo",
    membros: [
      {
        nome: "Tríceps corda na polia",
        alias: ["triceps corda", "triceps corda na polia", "rope triceps pushdown"],
        obs: "Permite a rotação externa do punho no final do movimento, aumentando a contração."
      },
      {
        nome: "Tríceps barra reta / barra em V na polia",
        alias: ["triceps barra reta", "triceps barra v", "triceps pushdown"],
        obs: "Permite erguer cargas mais pesadas de extensão de cotovelo."
      },
      {
        nome: "Tríceps Testa com barra W / halteres",
        alias: ["triceps testa", "skullcrusher", "triceps testa com barra w"],
        obs: "Posiciona os braços em 90° com o tronco, submetendo a cabeça longa a um alongamento significativo."
      },
      {
        nome: "Tríceps Francês / Overhead Cable Extension",
        alias: ["triceps frances", "triceps overhead", "triceps frances na polia"],
        obs: "Extensão de cotovelos com os braços acima da cabeça; posição ideal para a cabeça longa."
      },
      {
        nome: "Mergulho em paralelas / banco",
        alias: ["mergulho em paralelas", "dips triceps", "triceps paralelas"],
        obs: "Exercício composto com altíssimo recrutamento de fibras do tríceps."
      }
    ],
    tambem: ["Supino fechado"]
  },
  {
    id: "peito-press-inclinado",
    musculo: "Peitoral Maior (Fibras Claviculares) e Deltoide Anterior",
    padrao: "Press Horizontal Inclinado",
    membros: [
      {
        nome: "Supino inclinado com halteres",
        alias: ["supino inclinado com halteres", "supino inclinado halteres", "incline dumbbell press"],
        obs: "Excelente amplitude e alongamento para as fibras superiores do peitoral."
      },
      {
        nome: "Supino inclinado com barra",
        alias: ["supino inclinado com barra", "supino inclinado barra", "incline barbell press"],
        obs: "Permite cargas mais pesadas. Exige cuidado com a angulação do banco."
      },
      {
        nome: "Supino inclinado na máquina",
        alias: ["supino inclinado na maquina", "supino inclinado maquina", "incline machine press"],
        obs: "Mais seguro para chegar próximo da falha, com estabilidade total."
      },
      {
        nome: "Supino inclinado no Smith",
        alias: ["supino inclinado no smith", "supino inclinado smith"],
        obs: "Trajetória guiada, ideal para focar na sobrecarga progressiva."
      }
    ],
    tambem: ["Crossover baixo para cima", "Crucifixo inclinado"]
  },
  {
    id: "peito-isolador-crucifixo",
    musculo: "Peitoral Maior",
    padrao: "Adução Horizontal de Ombro",
    membros: [
      {
        nome: "Crucifixo reto com halteres",
        alias: ["crucifixo", "crucifixo reto", "crucifixo com halteres", "dumbbell fly"],
        obs: "Alongamento máximo do peitoral. Deve ser feito com cargas moderadas."
      },
      {
        nome: "Crucifixo inclinado com halteres",
        alias: ["crucifixo inclinado", "crucifixo inclinado halteres", "incline dumbbell fly"],
        obs: "Foca a porção clavicular (superior) do peitoral."
      },
      {
        nome: "Voador (Peck Deck)",
        alias: ["voador", "peck deck", "voador peck deck", "peck deck machine"],
        obs: "Trajetória fixa que isola o peitoral com segurança."
      },
      {
        nome: "Crossover na polia (alta ou baixa)",
        alias: ["crossover", "crossover na polia", "cable crossover"],
        obs: "Tensão constante do cabo e liberdade para escolher a angulação."
      }
    ],
    tambem: ["Supino reto"]
  },
  {
    id: "panturrilha",
    musculo: "Tríceps Sura (Gastrocnêmio e Sóleo)",
    padrao: "Flexão Plantar",
    membros: [
      {
        nome: "Panturrilha em pé (máquina ou Smith)",
        alias: ["panturrilha em pe", "panturrilha em pe na maquina", "standing calf raise"],
        obs: "Com os joelhos estendidos, foca predominantemente o gastrocnêmio."
      },
      {
        nome: "Panturrilha sentado",
        alias: ["panturrilha sentada", "panturrilha sentado na maquina", "seated calf raise"],
        obs: "Com os joelhos fletidos, o gastrocnêmio é 'desligado', focando o trabalho no sóleo."
      },
      {
        nome: "Panturrilha no leg press",
        alias: ["panturrilha no leg press", "panturrilha leg press", "calf press"],
        obs: "Permite usar cargas elevadas com estabilidade total do corpo."
      },
      {
        nome: "Panturrilha no Smith",
        alias: ["panturrilha no smith", "panturrilha smith", "smith calf raise"],
        obs: "Excelente controle da amplitude e da fase de alongamento."
      }
    ],
    tambem: []
  },
  {
    id: "abdomen-core",
    musculo: "Reto Abdominal e Oblíquos",
    padrao: "Flexão de Tronco / Quadril",
    membros: [
      {
        nome: "Abdominal na polia (Crunch)",
        alias: ["abdominal na polia", "abdominal cabo", "cable crunch"],
        obs: "Permite sobrecarga progressiva no abdômen usando peso."
      },
      {
        nome: "Elevação de pernas suspenso",
        alias: ["elevacao de pernas", "elevacao de pernas suspenso", "leg raise"],
        obs: "Foco na porção inferior do reto abdominal."
      },
      {
        nome: "Prancha (Plank)",
        alias: ["prancha", "prancha isometrica", "plank"],
        obs: "Excelente exercício isométrico para estabilização do core."
      },
      {
        nome: "Abdominal infra no banco",
        alias: ["abdominal infra", "abdominal no banco declinado", "reverse crunch"],
        obs: "Focado na elevação da pelve, isolando a parte inferior do abdômen."
      }
    ],
    tambem: ["Abdominal supra no solo"]
  },
  {
    id: "trapezio-encolhimento",
    musculo: "Trapézio Superior",
    padrao: "Elevação Escapular",
    membros: [
      {
        nome: "Encolhimento com barra",
        alias: ["encolhimento com barra", "encolhimento barra", "barbell shrug"],
        obs: "Constrói a espessura do trapézio. Foque em subir os ombros e segurar no topo."
      },
      {
        nome: "Encolhimento com halteres",
        alias: ["encolhimento com halteres", "encolhimento halteres", "dumbbell shrug"],
        obs: "Permite maior amplitude de movimento do que a barra."
      },
      {
        nome: "Encolhimento no Smith",
        alias: ["encolhimento no smith", "encolhimento smith", "smith shrug"],
        obs: "Trajetória fixa para cargas altas e foco total na elevação."
      }
    ],
    tambem: ["Face pull", "Remada alta"]
  }
];

export function normalizarString(str) {
  if (!str) return "";
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

export function getSubstitutosPara(nomeExercicio) {
  if (!nomeExercicio) return { principais: [], secundarios: [] };
  const busca = normalizarString(nomeExercicio);

  for (const familia of FAMILIAS) {
    const membroEncontrado = familia.membros.find(m => 
      normalizarString(m.nome) === busca || 
      m.alias.some(a => normalizarString(a) === busca) ||
      busca.includes(normalizarString(m.nome))
    );

    if (membroEncontrado) {
      const principais = familia.membros
        .filter(m => m.nome !== membroEncontrado.nome)
        .map(m => ({ name: m.nome, obs: m.obs }));

      const secundarios = familia.tambem.map(nome => ({
        name: nome,
        obs: "Substituto biomecânico de padrão vizinho/alternativo."
      }));

      return {
        exercicioOriginal: membroEncontrado.nome,
        grupoMuscular: familia.musculo,
        padraoMovimento: familia.padrao,
        principais,
        secundarios
      };
    }
  }

  return { exercicioOriginal: nomeExercicio, principais: [], secundarios: [] };
}