var yandexGeocoder = new YandexGeocoder({apiKey: '77520b33-ddcb-40fc-a751-19298702acc3'});

yandexGeocoder.resolve('Пермь, улица Бекетова', (err, collection) => {
    if (err) throw err;
    console.log(collection);
    /*    
    collection = [{
        obl: 'Пермский край',
        raion: 'городской округ Пермь',
        place: 'Пермь',
        street: 'улица Бекетова'
    }]
    */
});