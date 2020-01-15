# sume-srbije-api
Projekat na ovom repozitorijumu predstavlja backend aplikacije implementiran u Node.js-u.
U samom index.js fajlu nalazi se konekcija sa Cassandra bazom podataka, ciji je test sadrzaj eskportovan u csv i json fajlove. Eksportovani sadrzaj nalazi se u okviru ovog repozitorijuma u folderu CassandraDB Data. U ovom folderu su takodje smestena i dva txt fajla, jedan sa naredbama za kreiranje tabel i drugi sa inicijalnim podacima.
Osim konekcije ka bazi, u index.js fajlu nalaze se sve potrebne funkcije koje kveruju bazu. Projekat obuhvata sve CRUD operacije.
Kverijima se:
    -proverava autenticnost admina
        (kao parametar prosledjuje se email admina)
    -dobija statistika posumljavanja Republike Srbije u prosloj godini
    -dobija statistika sece drveca svih regiona Republike Srbijie na mesecnom nivou u prosloj godini
        (kao parametar prosledjuje se zeljeni mesec)
    -dobija statistika posumljavanja i sece drveca u odredjenom regionu Republike Srbije u toku prosle godine
        (kako parametar prosledjuje se id regiona)
    -dobija statistika posumljavanja i sece svkog drveta ponaosob u odredjenom region Republike Srbije u toku prosle godine
        (kao parametar prosledjuje se id regiona)
    -dobija statistika odnosa povrsine koja je posumljena i povrsine na kojoj je bilo seca u odredjenom regionu Republike Srbije u toku prosle godine
        (kao parametar prosledjuje se id regiona)
    -dobija spisak svih regiona Republike Srbije
    -dobija spisak svih zabelezenih vrsta drveca Republike Srbije
    -omogucuje unos statistike posumljavanja i seca konkretne vrste drveca za konkretan region. Pozeljno je statistiku unositi najkasnije dan-dva pred kraj meseca kako bi godisnji pregled statistike bio sto vise verodostojniji
        (kao parametar prosledjuje se id regiona, id drveta, broj posecenih stabala, povrsina na kojoj je bila seca, broj zasadjenih stabala, povrsina na kojoj se sadilo)
    -omogucuje unos nove vrste drveta i njegove statistike za konkretan region
        (kao parametar prosledjuje se id tipa drveta, naziv drveta, id regiona, broj posecenih stabala, povrsina na kojoj je bila seca, broj zasadjenih stabala, povrsina na kojoj se sadilo)
    -omogucuje uklanjanje neke vrste drveta
        (kao parametar prosledjuje se id drveta)

Statisticki prikaz vrsi se samo za podatke unete prosle godine, svaki novi uneseni podatak uz sebe pamti i mesec i godinu na osnovu dana unosa. Klijent ce moci da ih vidi tek pocetkom sledece godine. Za potrebe testiranja novih podataka moguce je u index.js fajlu odraditi find and replace d.getFullYear() - 1 sa d.getFullYear(). Ovo se javlja u linijama 189, 269, 323, 452 i 479.
Backend se pokrece na http://localhost:4000.