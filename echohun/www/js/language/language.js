class Language {
    resources = {
        pt_br : {           
            // Config   
            config : 'Configurações',

            // Inventario
            player : 'Jogador',
            level : 'Nível',
            language : 'Idioma',
            name : 'Português',
            inventory : 'Inventário',
            playerInfo : 'Informações do Jogador',
            bag : 'Mochila',
            info : 'Informações',
            hp : 'HP',
            stamina : 'Stamina',
            shield : 'Escudo',
            cost : 'Custo',
            
            // Game play
            gameOver : 'Você Morreu',
            paused : 'Pausado',
            mapWin : 'Você Concluiu o Mapa',
            
            // Controles
            controls : 'Controles',
            radar : 'Radar',  
            
            // Outros
            none : 'Nenhum',
            items : 'Itens',

            // Powerups
            powerup_hp_desc : 'Aumenta a vida do jogador em 50 pontos',
        },
        en_us : {            
            // Config
            config : 'Config',

            // Inventario
            player : 'Player',
            level : 'Level',
            language : 'Language',
            name : 'English',
            inventory : 'Inventory',
            playerInfo : 'Player Info',
            bag : 'Bag',
            info : 'Info',
            hp : 'HP',
            stamina : 'Stamina',
            shield : 'Shield',
            cost : 'Cost',
            
            // Game play
            gameOver : 'You Died',
            paused : 'Paused',
            mapWin : 'You Completed the Map',
            
            // Controles
            controls : 'Controls',            
            radar : 'Radar', 
            
            // Outros
            none : 'None',            
            items : 'Items',
            // Powerups
            powerup_hp_desc : 'Increases player health by 50 points',
        }
    }

    getResource(resource) {
        return this.resources[this.language][resource];
    }

    constructor(language) {
        this.language = language;
    }
}