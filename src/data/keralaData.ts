export const KERALA_DISTRICTS: string[] = [
    "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha",
    "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad",
    "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
];

// Complete mapping of all 14 districts and representative corresponding local bodies
// Contains Corporations (C), Municipalities (M), and Grama Panchayats (GP)
export const KERALA_LOCAL_BODIES: Record<string, string[]> = {
    "Thiruvananthapuram": [
        "Thiruvananthapuram (Corporation)", "Attingal (Municipality)", "Nedumangad (Municipality)", "Neyyattinkara (Municipality)", "Varkala (Municipality)",
        "Amboori (Gram Panchayat)", "Aryanad (Gram Panchayat)", "Aryancode (Gram Panchayat)", "Balaramapuram (Gram Panchayat)", "Karakulam (Gram Panchayat)", "Kattakada (Gram Panchayat)", "Kottukal (Gram Panchayat)", "Poovachal (Gram Panchayat)", "Vembayam (Gram Panchayat)", "Vilappil (Gram Panchayat)"
    ],
    "Kollam": [
        "Kollam (Corporation)", "Karunagappally (Municipality)", "Kottarakkara (Municipality)", "Paravur (Municipality)", "Punalur (Municipality)",
        "Aryankavu (Gram Panchayat)", "Chathannoor (Gram Panchayat)", "East Kallada (Gram Panchayat)", "Elampalloor (Gram Panchayat)", "Kalluvathukkal (Gram Panchayat)", "Kulathupuzha (Gram Panchayat)", "Mayyanad (Gram Panchayat)", "Oachira (Gram Panchayat)", "Pattazhy (Gram Panchayat)", "Sasthamcotta (Gram Panchayat)"
    ],
    "Pathanamthitta": [
        "Adoor (Municipality)", "Pandalam (Municipality)", "Pathanamthitta (Municipality)", "Thiruvalla (Municipality)",
        "Aranmula (Gram Panchayat)", "Ayiroor (Gram Panchayat)", "Chenneerkkara (Gram Panchayat)", "Cherukole (Gram Panchayat)", "Elanthoor (Gram Panchayat)", "Ezhamkulam (Gram Panchayat)", "Konni (Gram Panchayat)", "Kozhencherry (Gram Panchayat)", "Mallapuzhassery (Gram Panchayat)", "Naranganam (Gram Panchayat)", "Omalloor (Gram Panchayat)", "Ranni (Gram Panchayat)", "Seethathodu (Gram Panchayat)", "Vadasserikkara (Gram Panchayat)"
    ],
    "Alappuzha": [
        "Alappuzha (Municipality)", "Chengannur (Municipality)", "Cherthala (Municipality)", "Haripad (Municipality)", "Kayamkulam (Municipality)", "Mavelikkara (Municipality)",
        "Ambalappuzha North (Gram Panchayat)", "Ambalappuzha South (Gram Panchayat)", "Arookutty (Gram Panchayat)", "Aroor (Gram Panchayat)", "Chennam Pallippuram (Gram Panchayat)", "Edathua (Gram Panchayat)", "Kainakary (Gram Panchayat)", "Kavalam (Gram Panchayat)", "Kuttanad (Gram Panchayat)", "Mannanchery (Gram Panchayat)", "Muttar (Gram Panchayat)", "Nedumudi (Gram Panchayat)", "Pulinkunnoo (Gram Panchayat)", "Ramankary (Gram Panchayat)", "Thalavadi (Gram Panchayat)"
    ],
    "Kottayam": [
        "Changanassery (Municipality)", "Ettumanoor (Municipality)", "Kottayam (Municipality)", "Pala (Municipality)", "Vaikom (Municipality)", "Erattupetta (Municipality)",
        "Akalakunnam (Gram Panchayat)", "Ayarkunnam (Gram Panchayat)", "Bharananganam (Gram Panchayat)", "Chempu (Gram Panchayat)", "Erumeli (Gram Panchayat)", "Kadanad (Gram Panchayat)", "Kidangoor (Gram Panchayat)", "Kooroppada (Gram Panchayat)", "Koruthodu (Gram Panchayat)", "Kozhuvanal (Gram Panchayat)", "Kumarakom (Gram Panchayat)", "Manimala (Gram Panchayat)", "Mundakayam (Gram Panchayat)", "Mutholy (Gram Panchayat)", "Poonjar (Gram Panchayat)"
    ],
    "Idukki": [
        "Kattappana (Municipality)", "Thodupuzha (Municipality)",
        "Arakulam (Gram Panchayat)", "Bisonvalley (Gram Panchayat)", "Chakkupallam (Gram Panchayat)", "Devikulam (Gram Panchayat)", "Edavetty (Gram Panchayat)", "Elappara (Gram Panchayat)", "Erattayar (Gram Panchayat)", "Idukki-Kanjikuzhy (Gram Panchayat)", "Kamakshy (Gram Panchayat)", "Kanchiyar (Gram Panchayat)", "Kanthalloor (Gram Panchayat)", "Karimannoor (Gram Panchayat)", "Karunapuram (Gram Panchayat)", "Kokkayar (Gram Panchayat)", "Kumaramangalam (Gram Panchayat)", "Munnar (Gram Panchayat)"
    ],
    "Ernakulam": [
        "Kochi (Corporation)", "Aluva (Municipality)", "Angamaly (Municipality)", "Eloor (Municipality)", "Kalamassery (Municipality)", "Kothamangalam (Municipality)", "Maradu (Municipality)", "Muvattupuzha (Municipality)", "North Paravur (Municipality)", "Perumbavoor (Municipality)", "Piravom (Municipality)", "Thrikkakara (Municipality)", "Tripunithura (Municipality)",
        "Alangad (Gram Panchayat)", "Amballur (Gram Panchayat)", "Avoli (Gram Panchayat)", "Chellanam (Gram Panchayat)", "Chengamanad (Gram Panchayat)", "Cheranallur (Gram Panchayat)", "Chottanikkara (Gram Panchayat)", "Edakkattuvayal (Gram Panchayat)", "Edathala (Gram Panchayat)", "Elanji (Gram Panchayat)", "Kadungalloor (Gram Panchayat)", "Kalady (Gram Panchayat)", "Keezhmad (Gram Panchayat)"
    ],
    "Thrissur": [
        "Thrissur (Corporation)", "Chalakudy (Municipality)", "Chavakkad (Municipality)", "Guruvayur (Municipality)", "Irinjalakuda (Municipality)", "Kodungallur (Municipality)", "Kunnamkulam (Municipality)", "Wadakkanchery (Municipality)",
        "Adat (Gram Panchayat)", "Aloor (Gram Panchayat)", "Annamanada (Gram Panchayat)", "Anthikad (Gram Panchayat)", "Arimpur (Gram Panchayat)", "Athirappilly (Gram Panchayat)", "Avinissery (Gram Panchayat)", "Choondal (Gram Panchayat)", "Engandiyur (Gram Panchayat)", "Erumapetty (Gram Panchayat)", "Kadangode (Gram Panchayat)", "Kadavallur (Gram Panchayat)", "Kaipamangalam (Gram Panchayat)", "Kondazhy (Gram Panchayat)"
    ],
    "Palakkad": [
        "Cherpulassery (Municipality)", "Chittur-Thathamangalam (Municipality)", "Mannarkkad (Municipality)", "Ottappalam (Municipality)", "Palakkad (Municipality)", "Pattambi (Municipality)", "Shoranur (Municipality)",
        "Agali (Gram Panchayat)", "Akathethara (Gram Panchayat)", "Alathur (Gram Panchayat)", "Ambalappara (Gram Panchayat)", "Anakkara (Gram Panchayat)", "Ayiloor (Gram Panchayat)", "Chalavara (Gram Panchayat)", "Chalissery (Gram Panchayat)", "Elappully (Gram Panchayat)", "Erimayur (Gram Panchayat)", "Kannadi (Gram Panchayat)", "Kappur (Gram Panchayat)", "Kollengode (Gram Panchayat)", "Koppam (Gram Panchayat)"
    ],
    "Malappuram": [
        "Kondotty (Municipality)", "Kottakkal (Municipality)", "Malappuram (Municipality)", "Manjeri (Municipality)", "Nilambur (Municipality)", "Parappanangadi (Municipality)", "Perinthalmanna (Municipality)", "Ponnani (Municipality)", "Tirur (Municipality)", "Tirurangadi (Municipality)", "Valanchery (Municipality)", "Vengara (Municipality)",
        "A R Nagar (Gram Panchayat)", "Aliparamba (Gram Panchayat)", "Amarambalam (Gram Panchayat)", "Anakkayam (Gram Panchayat)", "Angadippuram (Gram Panchayat)", "Cheacode (Gram Panchayat)", "Chelembra (Gram Panchayat)", "Edappal (Gram Panchayat)", "Edavanna (Gram Panchayat)", "Kalpakanchery (Gram Panchayat)"
    ],
    "Kozhikode": [
        "Kozhikode (Corporation)", "Feroke (Municipality)", "Koduvally (Municipality)", "Koyilandy (Municipality)", "Mukkom (Municipality)", "Payyoli (Municipality)", "Ramanattukara (Municipality)", "Vadakara (Municipality)",
        "Arikkulam (Gram Panchayat)", "Atholi (Gram Panchayat)", "Ayancheri (Gram Panchayat)", "Balusseri (Gram Panchayat)", "Chakkittapara (Gram Panchayat)", "Changaloth (Gram Panchayat)", "Chemancheri (Gram Panchayat)", "Chengottukavu (Gram Panchayat)", "Cheruvannur (Gram Panchayat)", "Edacheri (Gram Panchayat)", "Eramala (Gram Panchayat)"
    ],
    "Wayanad": [
        "Kalpetta (Municipality)", "Mananthavady (Municipality)", "Sulthan Bathery (Municipality)",
        "Ambalavayal (Gram Panchayat)", "Edavaka (Gram Panchayat)", "Kaniyambetta (Gram Panchayat)", "Meenangadi (Gram Panchayat)", "Meppadi (Gram Panchayat)", "Mullankolly (Gram Panchayat)", "Muttil (Gram Panchayat)", "Nenmeni (Gram Panchayat)", "Noolpuzha (Gram Panchayat)", "Padinjarathara (Gram Panchayat)", "Panamaram (Gram Panchayat)", "Poothadi (Gram Panchayat)"
    ],
    "Kannur": [
        "Kannur (Corporation)", "Anthoor (Municipality)", "Iritty (Municipality)", "Kuthuparamba (Municipality)", "Mattannur (Municipality)", "Payyanur (Municipality)", "Sreekandapuram (Municipality)", "Thalassery (Municipality)", "Taliparamba (Municipality)",
        "Alakode (Gram Panchayat)", "Anjarakandy (Gram Panchayat)", "Aralam (Gram Panchayat)", "Ayyankunnu (Gram Panchayat)", "C Raman (Gram Panchayat)", "Chembilode (Gram Panchayat)", "Chengalayi (Gram Panchayat)", "Cherukunnu (Gram Panchayat)", "Chirakkal (Gram Panchayat)", "Chittariparamba (Gram Panchayat)"
    ],
    "Kasaragod": [
        "Kanhangad (Municipality)", "Kasaragod (Municipality)", "Nileshwar (Municipality)",
        "Ajanur (Gram Panchayat)", "Badiadka (Gram Panchayat)", "Balal (Gram Panchayat)", "Bedadka (Gram Panchayat)", "Bellur (Gram Panchayat)", "Chemnad (Gram Panchayat)", "Chengala (Gram Panchayat)", "Cheruvathur (Gram Panchayat)", "Delampady (Gram Panchayat)", "East Eleri (Gram Panchayat)", "Enmakaje (Gram Panchayat)", "Kallar (Gram Panchayat)", "Karadka (Gram Panchayat)"
    ]
};
