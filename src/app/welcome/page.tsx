
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-provider';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useMediaLists, type Media } from '@/hooks/use-media-lists';
import { cn } from '@/lib/utils';
import { User, LogIn, Loader2 } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const disneyAvatars = [
    "/assets/avatars/Disney+/disney channel_candace flynn-C1vj9fmL.png", "/assets/avatars/Disney+/disney channel_dipper pines-BH9djGet.png", "/assets/avatars/Disney+/disney channel_evie-TNF3SJ8P.png",
    "/assets/avatars/Disney+/disney channel_ferb fletcher-DZxjCKPV.png", "/assets/avatars/Disney+/disney channel_hannah montana-BvGnM0-U.png", "/assets/avatars/Disney+/disney channel_kim possible-B91HQRHt.png",
    "/assets/avatars/Disney+/disney channel_k_c_ cooper-BmtN-bxk.png", "/assets/avatars/Disney+/disney channel_louie-CxtRlxcg.png", "/assets/avatars/Disney+/disney channel_mabel pines-C91cQIYh.png",
    "/assets/avatars/Disney+/disney channel_mal-DAOUr8oZ.png", "/assets/avatars/Disney+/disney channel_perry the platypus-CSWQoALe.png", "/assets/avatars/Disney+/disney channel_phineas flynn-Cn12S7N1.png",
    "/assets/avatars/Disney+/disney channel_uma-Bvc6RyZN.png", "/assets/avatars/Disney+/disney classics_ariel-C9Wonnr0.png", "/assets/avatars/Disney+/disney classics_belle-DFBCGQvp.png",
    "/assets/avatars/Disney+/disney classics_cheshire cat-C3AEK1_c.png", "/assets/avatars/Disney+/disney classics_cinderella-DOJ8JBgC.png", "/assets/avatars/Disney+/disney classics_eeyore-CxLkxMu0.png",
    "/assets/avatars/Disney+/disney classics_genie-u0JKxzZZ.png", "/assets/avatars/Disney+/disney classics_jasmine-CsAtiRih.png", "/assets/avatars/Disney+/disney classics_lady-CgXXCizg.png",
    "/assets/avatars/Disney+/disney classics_marie-oy9hM3KB.png", "/assets/avatars/Disney+/disney classics_peter pan-BiLDn6Nb.png", "/assets/avatars/Disney+/disney classics_robin hood-BrRoG_VQ.png",
    "/assets/avatars/Disney+/disney classics_tinker bell-C1fqhqZv.png", "/assets/avatars/Disney+/disney classics_winnie the pooh-CeiAcVj8.png", "/assets/avatars/Disney+/disney princess_aurora-DzY4Z29x.png",
    "/assets/avatars/Disney+/disney princess_merida-BWNVQO9j.png", "/assets/avatars/Disney+/disney princess_mulan-DA4ZeGpX.png", "/assets/avatars/Disney+/disney princess_pocahontas-CaGRvyaB.png",
    "/assets/avatars/Disney+/disney princess_rapunzel-1dojiL-N.png", "/assets/avatars/Disney+/disney_asha-DItm9ikG.png", "/assets/avatars/Disney+/disney_baymax-BvTzDbJd.png",
    "/assets/avatars/Disney+/disney_elsa-B0K-ra__.png", "/assets/avatars/Disney+/disney_ethan clade-B3DZN7w6.png", "/assets/avatars/Disney+/disney_minnie mouse-AyQKUyHK.png",
    "/assets/avatars/Disney+/disney_mirabel-mEe4hjOj.png", "/assets/avatars/Disney+/disney_olaf-wHOckGMY.png", "/assets/avatars/Disney+/disney_penny proud-BU-pfqUF.png",
    "/assets/avatars/Disney+/disney_pua-RjCBJVJv.png", "/assets/avatars/Disney+/disney_raya-BAX0IfR4.png", "/assets/avatars/Disney+/disney_sisu-D0fQ4i14.png",
    "/assets/avatars/Disney+/disney_snow white-pYTcGIlI.png", "/assets/avatars/Disney+/disney_star-D2Q9ON8A.png", "/assets/avatars/Disney+/disney_tiana-DZiSKW-w.png",
    "/assets/avatars/Disney+/ice age_buck-DxC_63h5.png", "/assets/avatars/Disney+/ice age_diego-J0vsYuSK.png", "/assets/avatars/Disney+/ice age_ellie-DuvaNJGC.png",
    "/assets/avatars/Disney+/ice age_manny-BFjj6N3-.png", "/assets/avatars/Disney+/ice age_scrat-CYoKyCe5.png", "/assets/avatars/Disney+/ice age_sid-BujbNl-P.png",
    "/assets/avatars/Disney+/kids_bandit-BCd5vUHX.png", "/assets/avatars/Disney+/kids_bingo-2-Cld1asjl.png", "/assets/avatars/Disney+/kids_bingo-B_zweNBe.png",
    "/assets/avatars/Disney+/kids_bluey-BJCgiYXr.png", "/assets/avatars/Disney+/kids_chilli-D9BcExBE.png", "/assets/avatars/Disney+/kids_doc mcstuffins-D1FRCNex.png",
    "/assets/avatars/Disney+/kids_elena-DedlhNO3.png", "/assets/avatars/Disney+/kids_gekko_greg-BoHODpbU.png", "/assets/avatars/Disney+/kids_kai brightstar-C-vZYVBa.png",
    "/assets/avatars/Disney+/kids_kion-CCwKfeKi.png", "/assets/avatars/Disney+/kids_nash durango-DZsSVkUq.png", "/assets/avatars/Disney+/kids_nubs-Dt4vGu18.png",
    "/assets/avatars/Disney+/kids_rolly-Dle0HjMY.png", "/assets/avatars/Disney+/kids_vampirina-Dht-838p.png", "/assets/avatars/Disney+/marvel_black widow-DE7KfpS4.png",
    "/assets/avatars/Disney+/marvel_daredevil-C49aNhM3.png", "/assets/avatars/Disney+/marvel_doctor strange-Ck_xul1S.png", "/assets/avatars/Disney+/marvel_hulk-DeniYs9k.png",
    "/assets/avatars/Disney+/marvel_kingpin-DN9sIAyf.png", "/assets/avatars/Disney+/marvel_loki-96Y1uRlE.png", "/assets/avatars/Disney+/marvel_moon knight-B62gPqOR.png",
    "/assets/avatars/Disney+/marvel_ms_ marvel-BYgdOOhn.png", "/assets/avatars/Disney+/marvel_sam wilson-Bpuhv9GV.png", "/assets/avatars/Disney+/marvel_scarlet wanda-Bv_XKMyN.png",
    "/assets/avatars/Disney+/marvel_sersi _ eternals movie --GcsGEc7.png", "/assets/avatars/Disney+/marvel_shang-chi-BrA0LmpI.png", "/assets/avatars/Disney+/marvel_she-hulk-BkyatXrc.png",
    "/assets/avatars/Disney+/marvel_spider-man-m9bavF6V.png", "/assets/avatars/Disney+/marvel_thor-C6LxWX5t.png", "/assets/avatars/Disney+/mickey and friends_chip-BPsyIgJI.png",
    "/assets/avatars/Disney+/mickey and friends_daisy duck-BosoJ6tY.png", "/assets/avatars/Disney+/mickey and friends_dale-Z72a2LEv.png", "/assets/avatars/Disney+/mickey and friends_dewey-DAnwX94O.png",
    "/assets/avatars/Disney+/mickey and friends_donald duck-BiKubSvu.png", "/assets/avatars/Disney+/mickey and friends_goofy-A1kHiX5L.png", "/assets/avatars/Disney+/mickey and friends_huey-b82OA003.png",
    "/assets/avatars/Disney+/mickey and friends_jose carioca-D_0lUAwp.png", "/assets/avatars/Disney+/mickey and friends_launchpad mcquack-BqRjSa3Y.png", "/assets/avatars/Disney+/mickey and friends_mickey mouse-i8Eaf_lM.png",
    "/assets/avatars/Disney+/mickey and friends_pluto-DH6FKOrr.png", "/assets/avatars/Disney+/mickey and friends_scrooge mcduck-D6aF_Yhz.png", "/assets/avatars/Disney+/mickey and friends_webby vanderquack-BVxEzawC.png",
    "/assets/avatars/Disney+/national geographic_dolphin-BzUjEwyG.png", "/assets/avatars/Disney+/national geographic_elephant-D_0_X1Qy.png", "/assets/avatars/Disney+/national geographic_gibbon-ytSlm-XH.png",
    "/assets/avatars/Disney+/national geographic_jaguar-QPnA9B98.png", "/assets/avatars/Disney+/national geographic_panda-CSPv0eCu.png", "/assets/avatars/Disney+/national geographic_penguin-BseHmOOw.png",
    "/assets/avatars/Disney+/national geographic_sharkfest - ensemble-KRHiTirZ.png", "/assets/avatars/Disney+/pixar_alberto scorfano-DXbyGNYx.png", "/assets/avatars/Disney+/pixar_anger-C_hApDjp.png",
    "/assets/avatars/Disney+/pixar_buzz lightyear-CEfZt3E_.png", "/assets/avatars/Disney+/pixar_disgust-BKgFJc7Z.png", "/assets/avatars/Disney+/pixar_ember-DO7t0zxr.png",
    "/assets/avatars/Disney+/pixar_fear-nMx_twgy.png", "/assets/avatars/Disney+/pixar_joe-DZDhv2RE.png", "/assets/avatars/Disney+/pixar_joy-CSSEgFN6.png",
    "/assets/avatars/Disney+/pixar_lightning mcqueen-Dz8pO3Nx.png", "/assets/avatars/Disney+/pixar_luca - ensemble-2-DHE4t4fk.png", "/assets/avatars/Disney+/pixar_luca - ensemble-BlAeVwGy.png",
    "/assets/avatars/Disney+/pixar_mater-DkIDQxez.png", "/assets/avatars/Disney+/pixar_meilin lee-DtW2RZ39.png", "/assets/avatars/Disney+/pixar_sadness-BvwEpNHK.png",
    "/assets/avatars/Disney+/pixar_wade-CPqItv5G.png", "/assets/avatars/Disney+/star wars_ahsoka tano-CFOJ5rEd.png", "/assets/avatars/Disney+/star wars_bo-katan kryze-BwUWB3gh.png",
    "/assets/avatars/Disney+/star wars_boba fett-C8QFzz1t.png", "/assets/avatars/Disney+/star wars_cassian andor-Bhd1zk_I.png", "/assets/avatars/Disney+/star wars_darth vader-DfWHA8t2.png",
    "/assets/avatars/Disney+/star wars_huyang-BDSGsBAL.png", "/assets/avatars/Disney+/star wars_loth-cats-Cal1Sbu6.png", "/assets/avatars/Disney+/star wars_lys solay-BcFV39JZ.png",
    "/assets/avatars/Disney+/star wars_obi-wan kenobi-rXXVGSdR.png", "/assets/avatars/Disney+/star wars_reva-JkoYPzQX.png", "/assets/avatars/Disney+/star wars_the child-D3HQIIdX.png",
    "/assets/avatars/Disney+/star wars_the mandalorian-OTyLNb1m.png", "/assets/avatars/Disney+/the muppets_animal-Brzo_leC.png", "/assets/avatars/Disney+/the muppets_beaker-BsP3Ptfz.png",
    "/assets/avatars/Disney+/the muppets_fozzie bear-BLRv-d_I.png", "/assets/avatars/Disney+/the muppets_gonzo-DIzZ66h0.png", "/assets/avatars/Disney+/the muppets_janice-w-AxFDCK.png",
    "/assets/avatars/Disney+/the muppets_kermit the frog-CH96OK_o.png", "/assets/avatars/Disney+/the muppets_miss piggy-DIlkrb-d.png", "/assets/avatars/Disney+/the muppets_pepe the king prawn-B9W4U6Wt.png",
    "/assets/avatars/Disney+/the muppets_scooter-HVVSgOCW.png", "/assets/avatars/Disney+/the muppets_the swedish chef-BqMefekp.png", "/assets/avatars/Disney+/the simpsons_bart simpson-DuomYjwc.png",
    "/assets/avatars/Disney+/the simpsons_dr_ julius hibbert-DrNK5MU9.png", "/assets/avatars/Disney+/the simpsons_homer simpson-C2kqrGX6.png", "/assets/avatars/Disney+/the simpsons_krusty the clown-BNemYwrL.png",
    "/assets/avatars/Disney+/the simpsons_lisa simpson-Br4660Vs.png", "/assets/avatars/Disney+/the simpsons_maggie simpson-DUv3_ncr.png", "/assets/avatars/Disney+/the simpsons_marge simpson-c35VK5WW.png",
    "/assets/avatars/Disney+/the simpsons_ralph wiggum-CgPlT7xm.png", "/assets/avatars/Disney+/villains_cruella de vil _e stone-B2q8-4GK.png", "/assets/avatars/Disney+/villains_cruella de vil-XcYjh39j.png",
    "/assets/avatars/Disney+/villains_dr_ doofenshmirtz-BR0uRk3P.png", "/assets/avatars/Disney+/villains_dr_ facilier-DVAwYBQ6.png", "/assets/avatars/Disney+/villains_gaston-DJ6JGKah.png",
    "/assets/avatars/Disney+/villains_hades-fQ3GpMvc.png", "/assets/avatars/Disney+/villains_jafar-Q6BV869r.png", "/assets/avatars/Disney+/villains_maleficent-D6DUDWjO.png",
    "/assets/avatars/Disney+/villains_mother gothel-CN_WTrdS.png", "/assets/avatars/Disney+/villains_queen of hearts-DczjZOhT.png", "/assets/avatars/Disney+/villains_queen _snow white-DNdpMTEv.png",
    "/assets/avatars/Disney+/villains_randall boggs-CdFW7Din.png", "/assets/avatars/Disney+/villains_scar-CsaKuItO.png", "/assets/avatars/Disney+/villains_ursula-B_s7Eok2.png",
    "/assets/avatars/Disney+/villains_yzma-XW5KIGRn.png"
];
const netflixAvatars = [
    "/assets/avatars/Netflix/aib-arisu-vieux-C_qonjjQ.png", "/assets/avatars/Netflix/aib-joker-Fe3fAlEV.png", "/assets/avatars/Netflix/aib-jsais-plus-Dcr6kVBs.png",
    "/assets/avatars/Netflix/aib-jsais-plus-non-plus-Ccxz9AYA.png", "/assets/avatars/Netflix/aib-kazuya-DOJ-XAOQ.png", "/assets/avatars/Netflix/aib-la-meuf-darisu-I9XuILj3.png",
    "/assets/avatars/Netflix/aib-la-meuf-qui-drogue-arisu-yXQQ3gHM.png", "/assets/avatars/Netflix/aib-le-crackhead-Cf2PIQHc.png", "/assets/avatars/Netflix/aib-le-mec-qui-stop-le-temps-la-B9R0DtTi.png",
    "/assets/avatars/Netflix/aib-lhandicape-BTCRLcKb.png", "/assets/avatars/Netflix/aib-psychopathe-Ceh4-s9K.png", "/assets/avatars/Netflix/aib-rei-jtm-DhHC47zI.png",
    "/assets/avatars/Netflix/arcane_caitlyn-B5XAofYf.png", "/assets/avatars/Netflix/arcane_ekko-BYtL1mPN.png", "/assets/avatars/Netflix/arcane_heimerdinger-Ca4H8a3h.png",
    "/assets/avatars/Netflix/arcane_jayce-CVpftrBg.png", "/assets/avatars/Netflix/arcane_jinx-CF6k_vCj.png", "/assets/avatars/Netflix/arcane_mel-CXdsqURD.png",
    "/assets/avatars/Netflix/arcane_poro-CWsD6Ki2.png", "/assets/avatars/Netflix/arcane_sevika-BYgNg6dS.png", "/assets/avatars/Netflix/arcane_silco-BrTjsxTt.png",
    "/assets/avatars/Netflix/arcane_vander-lGIbvjf7.png", "/assets/avatars/Netflix/arcane_vi-CvSxpGd-.png", "/assets/avatars/Netflix/arcane_viktor-CSpruQta.png",
    "/assets/avatars/Netflix/beauty-in-black_alex-BrRh4QCh.png", "/assets/avatars/Netflix/beauty-in-black_angel-DH-xvNfC.png", "/assets/avatars/Netflix/beauty-in-black_charles-DXHWLCj7.png",
    "/assets/avatars/Netflix/beauty-in-black_horace-B01cVwqT.png", "/assets/avatars/Netflix/beauty-in-black_jules-C6731MeE.png", "/assets/avatars/Netflix/beauty-in-black_kimmie-CCgjyc-m.png",
    "/assets/avatars/Netflix/beauty-in-black_mallory-Da7AKMLg.png", "/assets/avatars/Netflix/beauty-in-black_norman-DF6NbAPQ.png", "/assets/avatars/Netflix/beauty-in-black_olivia-CujA9xob.png",
    "/assets/avatars/Netflix/beauty-in-black_rain-rpo5X6Y9.png", "/assets/avatars/Netflix/beauty-in-black_roy-XlP5CdU2.png", "/assets/avatars/Netflix/beauty-in-black_varney-UAuEvDdw.png",
    "/assets/avatars/Netflix/big-mouth_andrew-DcKZODgf.png", "/assets/avatars/Netflix/big-mouth_coach_steve-BVMoAM4D.png", "/assets/avatars/Netflix/big-mouth_connie-C1V8k8dZ.png",
    "/assets/avatars/Netflix/big-mouth_jay-CRjszezr.png", "/assets/avatars/Netflix/big-mouth_jessi-B0mJDJFA.png", "/assets/avatars/Netflix/big-mouth_maury-DHIszlCm.png",
    "/assets/avatars/Netflix/big-mouth_missy-DBqxrmI5.png", "/assets/avatars/Netflix/big-mouth_nick-qNkEFpgQ.png", "/assets/avatars/Netflix/big-mouth_oreiller-wSubpMuA.png",
    "/assets/avatars/Netflix/black-mirror_bandersnatch-CN0bwA11.png", "/assets/avatars/Netflix/black-mirror_foulode-0RhX9oHU.png", "/assets/avatars/Netflix/black-mirror_glyphe-DoT3jIVb.png",
    "/assets/avatars/Netflix/black-mirror_icne_de_chargement-C9ejWjhC.png", "/assets/avatars/Netflix/black-mirror_poupe-BLJQRLHw.png", "/assets/avatars/Netflix/black-mirror_singe_en_peluche-q_t6PMs-.png",
    "/assets/avatars/Netflix/black-mirror_visage_moticne_casse-DiwrsD28.png", "/assets/avatars/Netflix/black-mirror_waldo-Dl-3cIEc.png", "/assets/avatars/Netflix/bojack-horseman_bojack-DU_r4Ohn.png",
    "/assets/avatars/Netflix/bojack-horseman_diane-DvK1brR9.png", "/assets/avatars/Netflix/bojack-horseman_m_peanutbutter-DlDKYd6l.png", "/assets/avatars/Netflix/bojack-horseman_princesse_carolyn-nd0EmhRs.png",
    "/assets/avatars/Netflix/bojack-horseman_todd-COuPJ6Ou.png", "/assets/avatars/Netflix/cobra-kai_amanda-Bf8_iHlV.png", "/assets/avatars/Netflix/cobra-kai_anthony-Dl_uiw7R.png",
    "/assets/avatars/Netflix/cobra-kai_axel-D_vF6R95.png", "/assets/avatars/Netflix/cobra-kai_carmen-DmmyAnSN.png", "/assets/avatars/Netflix/cobra-kai_chozen-DsiWUnup.png",
    "/assets/avatars/Netflix/cobra-kai_daniel-DRehUYTf.png", "/assets/avatars/Netflix/cobra-kai_devon-DhcipvQA.png", "/assets/avatars/Netflix/cobra-kai_dimitri-DxHpB6QF.png",
    "/assets/avatars/Netflix/cobra-kai_johnny-KBczCHN8.png", "/assets/avatars/Netflix/cobra-kai_kenny-Dgi74RQN.png", "/assets/avatars/Netflix/cobra-kai_kreese-o9ltUhad.png",
    "/assets/avatars/Netflix/cobra-kai_kwon-zbcNoL67.png", "/assets/avatars/Netflix/cobra-kai_laigle-CH9vDTEW.png", "/assets/avatars/Netflix/cobra-kai_miguel--VUz3j1p.png",
    "/assets/avatars/Netflix/cobra-kai_m_miyagi-RfcJlLE3.png", "/assets/avatars/Netflix/cobra-kai_robby-BpkpUGfb.png", "/assets/avatars/Netflix/cobra-kai_samantha-DbBFea6o.png",
    "/assets/avatars/Netflix/cobra-kai_sensei_kim-CYssXiWB.png", "/assets/avatars/Netflix/cobra-kai_sensei_wolf-B0D7iM3L.png", "/assets/avatars/Netflix/cobra-kai_terry_silver-BJRnJUEW.png",
    "/assets/avatars/Netflix/cobra-kai_tory-BTmagy63.png", "/assets/avatars/Netflix/cobra-kai_zara-CYi3Ggr5.png", "/assets/avatars/Netflix/dark_claudia-CqEoavHW.png",
    "/assets/avatars/Netflix/dark_jeune_jonas-BRN8EuOW.png", "/assets/avatars/Netflix/dark_jeune_martha-CVdxsN1m.png", "/assets/avatars/Netflix/dark_machine_voyager_dans_le_temps-DjmLs5ik.png",
    "/assets/avatars/Netflix/dark_mikkel-BZGPLJA2.png", "/assets/avatars/Netflix/dark_noah-C0W4Yl50.png", "/assets/avatars/Netflix/dark_nud_de_la_trinit-DDgdWPr7.png",
    "/assets/avatars/Netflix/dark_sombre_matire-BW1q83iC.png", "/assets/avatars/Netflix/dark_tannhaus-BqMEkWIS.png", "/assets/avatars/Netflix/dark_vieille_martha-Cr-77s7_.png",
    "/assets/avatars/Netflix/dark_vieux_jonas-BARaEltU.png", "/assets/avatars/Netflix/dsenchante_bean-Dssspgj_.png", "/assets/avatars/Netflix/dsenchante_elfo-DLRAavP4.png",
    "/assets/avatars/Netflix/dsenchante_luci-CCnGRCwa.png", "/assets/avatars/Netflix/dsenchante_oona-BUBu9frW.png", "/assets/avatars/Netflix/dsenchante_stan_le_bourreau-CNbGr7yz.png",
    "/assets/avatars/Netflix/dsenchante_zog-DSgD4fWb.png", "/assets/avatars/Netflix/enid-DEWt9m2f.png", "/assets/avatars/Netflix/frere-de-mercredi-Dh7l5MnB.png",
    "/assets/avatars/Netflix/jeudi-CBloyiNt.png", "/assets/avatars/Netflix/jspcqui-CRMgjyrf.png", "/assets/avatars/Netflix/kpop-demon-hunters_abby_saja-EDJhZeGR.png",
    "/assets/avatars/Netflix/kpop-demon-hunters_baby_saja-_7unYEVm.png", "/assets/avatars/Netflix/kpop-demon-hunters_bobby-vztVWmS2.png", "/assets/avatars/Netflix/kpop-demon-hunters_derpy-pTQUAJFo.png",
    "/assets/avatars/Netflix/kpop-demon-hunters_jinu-C3u760J8.png", "/assets/avatars/Netflix/kpop-demon-hunters_mira-C7q7bnix.png", "/assets/avatars/Netflix/kpop-demon-hunters_mystery_saja-Tmx9H5bT.png",
    "/assets/avatars/Netflix/kpop-demon-hunters_romance_saja-B4noPscn.png", "/assets/avatars/Netflix/kpop-demon-hunters_rumi-DyZRIbXA.png", "/assets/avatars/Netflix/kpop-demon-hunters_sussie-BdeOMMWp.png",
    "/assets/avatars/Netflix/kpop-demon-hunters_zoey-XyJ5tXhC.png", "/assets/avatars/Netflix/la-casa-de-papel_berlin-BnibrxEE.png", "/assets/avatars/Netflix/la-casa-de-papel_denver-DFzayFdZ.png",
    "/assets/avatars/Netflix/la-casa-de-papel_le_professeur-DCGMPM_M.png", "/assets/avatars/Netflix/la-casa-de-papel_lisbonne-CsHDOHo2.png", "/assets/avatars/Netflix/la-casa-de-papel_masque-DVY77Ttc.png",
    "/assets/avatars/Netflix/la-casa-de-papel_nairobi-lYrTFljZ.png", "/assets/avatars/Netflix/la-casa-de-papel_palerme-BCAhltfv.png", "/assets/avatars/Netflix/la-casa-de-papel_rio--mj3KDFG.png",
    "/assets/avatars/Netflix/la-casa-de-papel_sierra-lLHOCsGE.png", "/assets/avatars/Netflix/la-casa-de-papel_tokyo-VAlwptpS.png", "/assets/avatars/Netflix/la-chronique-des-bridgerton_anthony_bridgerton-D_Inp2E8.png",
    "/assets/avatars/Netflix/la-chronique-des-bridgerton_bndict_bridgerton-Dyc1Ado3.png", "/assets/avatars/Netflix/la-chronique-des-bridgerton_colin_bridgerton-kDz5EQUq.png", "/assets/avatars/Netflix/la-chronique-des-bridgerton_daphn_bridgerton-CxiSYVI-.png",
    "/assets/avatars/Netflix/la-chronique-des-bridgerton_edwina_sharma-D4qt_wcf.png", "/assets/avatars/Netflix/la-chronique-des-bridgerton_francesca_bridgerton-FYXfNKaR.png", "/assets/avatars/Netflix/la-chronique-des-bridgerton_kate_sharma-DiN2UqNu.png",
    "/assets/avatars/Netflix/la-chronique-des-bridgerton_lady_bridgerton-C6qHhfOh.png", "/assets/avatars/Netflix/la-chronique-des-bridgerton_lady_danbury-EG4XquxH.png", "/assets/avatars/Netflix/la-chronique-des-bridgerton_lady_featherington-Dq-v0s6U.png",
    "/assets/avatars/Netflix/la-chronique-des-bridgerton_lady_whistledown-DXtrAWMW.png", "/assets/avatars/Netflix/la-chronique-des-bridgerton_la_reine_charlotte-BIVaWVPD.png", "/assets/avatars/Netflix/la-chronique-des-bridgerton_lose_bridgerton-DdGzdAIX.png",
    "/assets/avatars/Netflix/la-chronique-des-bridgerton_marina_thompson-C5uFu6af.png", "/assets/avatars/Netflix/la-chronique-des-bridgerton_pnlope_featherington-BArNyKZK.png", "/assets/avatars/Netflix/la-chronique-des-bridgerton_simon_basset-o0ApCq_A.png",
    "/assets/avatars/Netflix/la-grand-mere-DBaTkZYR.png", "/assets/avatars/Netflix/la-mano-EAOH57bj.png", "/assets/avatars/Netflix/le-loup-garou-jcrois-CbuwaGfZ.png",
    "/assets/avatars/Netflix/love_-death-_-robots_femme_dore-TpSMvU3f.png", "/assets/avatars/Netflix/love_-death-_-robots_k-vrc-CI3EjJxi.png", "/assets/avatars/Netflix/love_-death-_-robots_le_tmoin-BWZzDex5.png",
    "/assets/avatars/Netflix/love_-death-_-robots_rose-BLDKtgb3.png", "/assets/avatars/Netflix/love_-death-_-robots_sonnie-Drxladsv.png", "/assets/avatars/Netflix/love_-death-_-robots_zima-C9kMTjCI.png",
    "/assets/avatars/Netflix/lucifer_amenadiel-FUjMj8Ie.png", "/assets/avatars/Netflix/lucifer_avatar_de_profil-BVPOZ7pe.png", "/assets/avatars/Netflix/lucifer_chloe-BWPfxgiF.png",
    "/assets/avatars/Netflix/lucifer_dan-BOIL3RRA.png", "/assets_avatars/Netflix/lucifer_ella-BOdOij9A.png", "/assets/avatars/Netflix/lucifer_linda-Bzeu93IU.png",
    "/assets/avatars/Netflix/lucifer_lucifer--Byu8K_6.png", "/assets/avatars/Netflix/lucifer_maze-B5jcY7lM.png", "/assets/avatars/Netflix/lupin_assane_lagent_de_scurit-EKvN3SY1.png",
    "/assets/avatars/Netflix/lupin_assane_lboueur-Dp9hmYaZ.png", "/assets/avatars/Netflix/lupin_assane_le_geek-D4DDIUtS.png", "/assets/avatars/Netflix/lupin_assane_le_gentleman_cambrioleur-5DFQOIid.png",
    "/assets/avatars/Netflix/lupin_assane_le_sapeur-B4A-DDfk.png", "/assets/avatars/Netflix/lupin_assane_le_vieil_homme-BtjVJLdJ.png", "/assets/avatars/Netflix/lupin_assane_le_voyou-M-Q_sV52.png",
    "/assets/avatars/Netflix/lupin_assane_lhomme_au_chapeau-DejOoNCQ.png", "/assets/avatars/Netflix/lupin_assane_lhomme_daffaires-BCgkC6W7.png", "/assets/avatars/Netflix/lupin_assane_lhomme_de_mnage-DKxuDtpE.png",
    "/assets/avatars/Netflix/lupin_assane_lhomme_lgant-NH9nZKgo.png", "/assets/avatars/Netflix/lupin_jaccuse-BIPgNCch.png", "/assets/avatars/Netflix/lupin_la_perle_noire-BFYbzaq6.png",
    "/assets/avatars/Netflix/mere-8j5O-7xe.png", "/assets/avatars/Netflix/meuf-chelou-F1Rkf6HT.png", "/assets/avatars/Netflix/nicotine-D69dhJf6.png",
    "/assets/avatars/Netflix/on-my-block_cesar-N75ueWBZ.png", "/assets/avatars/Netflix/on-my-block_jamal-BGSSitIK.png", "/assets/avatars/Netflix/on-my-block_jasmine-DNwfAz9n.png",
    "/assets/avatars/Netflix/on-my-block_juanita-DdS2AX_C.png", "/assets/avatars/Netflix/on-my-block_monse-D3XmxPOA.png", "/assets/avatars/Netflix/on-my-block_ruby-oPw_DBd2.png",
    "/assets/avatars/Netflix/on-my-block_spooky-DvjWMCdo.png", "/assets/avatars/Netflix/one-piece_arlong-PcTi2I_B.png", "/assets/avatars/Netflix/one-piece_baggy-BE3_uW2f.png",
    "/assets/avatars/Netflix/one-piece_escargophone-BLcXzvW8.png", "/assets/avatars/Netflix/one-piece_garp-BmZO5XeP.png", "/assets/avatars/Netflix/one-piece_kobby-0YQlbID5.png",
    "/assets/avatars/Netflix/one-piece_le_vogue_merry-9YBG_kt2.png", "/assets/avatars/Netflix/one-piece_luffy-DJaiYcJR.png", "/assets/avatars/Netflix/one-piece_mihawk-C7gjvL-b.png",
    "/assets/avatars/Netflix/one-piece_nami-DKs4BMpq.png", "/assets/avatars/Netflix/one-piece_pavillon-Dlgslg11.png", "/assets/avatars/Netflix/one-piece_sanji-UvkG_Mns.png",
    "/assets/avatars/Netflix/one-piece_shanks-Ca1waVs2.png", "/assets/avatars/Netflix/one-piece_usopp-Ck9nESoS.png", "/assets/avatars/Netflix/one-piece_zoro-BmZo-lKp.png",
    "/assets/avatars/Netflix/orange-is-the-new-black_alex-Dw5Ws_ph.png", "/assets/avatars/Netflix/orange-is-the-new-black_black_cindy-DaDPI4oY.png", "/assets/avatars/Netflix/orange-is-the-new-black_daya-udUNgczu.png",
    "/assets/avatars/Netflix/orange-is-the-new-black_gloria-CIVBSn9P.png", "/assets/avatars/Netflix/orange-is-the-new-black_nicky-DCUDhaR7.png", "/assets/avatars/Netflix/orange-is-the-new-black_piper-DQzGm0nm.png",
    "/assets/avatars/Netflix/orange-is-the-new-black_poulet_onb-CPtLf9TB.png", "/assets/avatars/Netflix/orange-is-the-new-black_red-B9YN_VCD.png", "/assets/avatars/Netflix/orange-is-the-new-black_suzanne-CGE3XWXv.png",
    "/assets/avatars/Netflix/orange-is-the-new-black_taystee-Bq8Ggz2g.png", "/assets/avatars/Netflix/outer-banks_cleo-wrS8oKvf.png", "/assets/avatars/Netflix/outer-banks_jj-BupciCeI.png",
    "/assets/avatars/Netflix/outer-banks_john_b-Brjbl1kC.png", "/assets/avatars/Netflix/outer-banks_kiara-Dv1vH43f.png", "/assets/avatars/Netflix/outer-banks_pope-CGh0dxqI.png",
    "/assets/avatars/Netflix/outer-banks_rafe-LEz59HIa.png", "/assets/avatars/Netflix/outer-banks_sarah-Cot6YWdq.png", "/assets/avatars/Netflix/perdus-dans-l'espace_don_west-3XmzZEgS.png",
    "/assets/avatars/Netflix/perdus-dans-l'espace_dr_smith-BTlBTzFX.png", "/assets/avatars/Netflix/perdus-dans-l'espace_john-BZYRZLib.png", "/assets/avatars/Netflix/perdus-dans-l'espace_judy-BwuqNCJy.png",
    "/assets/avatars/Netflix/perdus-dans-l'espace_maureen-CGV-vqEJ.png", "/assets/avatars/Netflix/perdus-dans-l'espace_penny-D-go35yj.png", "/assets/avatars/Netflix/perdus-dans-l'espace_poulet_lis-B17mx2NS.png",
    "/assets/avatars/Netflix/perdus-dans-l'espace_robot-CHE3HMNR.png", "/assets/avatars/Netflix/perdus-dans-l'espace_will-0K7QIXGq.png", "/assets/avatars/Netflix/pere-BLyrNjnT.png",
    "/assets/avatars/Netflix/sandman_dsir-DnxUY3UM.png", "/assets/avatars/Netflix/sandman_irving-1EzJyEFi.png", "/assets_avatars/Netflix/sandman_johanna-DxnibDOk.png",
    "/assets/avatars/Netflix/sandman_lucienne-BxIaHZwB.png", "/assets/avatars/Netflix/sandman_lucifer-DmwDDrz8.png", "/assets/avatars/Netflix/sandman_matthew-D9F-jzj_.png",
    "/assets/avatars/Netflix/sandman_mort-By1bJhMV.png", "/assets/avatars/Netflix/sandman_rve-BgZfIS2j.png", "/assets/avatars/Netflix/sex-education_adam-DiAaOFAg.png",
    "/assets/avatars/Netflix/sex-education_aimee-BBIMyO9O.png", "/assets/avatars/Netflix/sex-education_anwar-CePcnt9w.png", "/assets/avatars/Netflix/sex-education_cal-CfEztvy1.png",
    "/assets/avatars/Netflix/sex-education_eric-Du6CUSXu.png", "/assets/avatars/Netflix/sex-education_isaac-CWjZtNWu.png", "/assets/avatars/Netflix/sex-education_jackson-DePbQVic.png",
    "/assets/avatars/Netflix/sex-education_jean-Do8Pu5Su.png", "/assets/avatars/Netflix/sex-education_lily-DNuQSyls.png", "/assets/avatars/Netflix/sex-education_maeve-Bp5yrey-.png",
    "/assets/avatars/Netflix/sex-education_ola-q_onlDEE.png", "/assets/avatars/Netflix/sex-education_olivia-DEDSRX6j.png", "/assets/avatars/Netflix/sex-education_otis-dHH7FTff.png",
    "/assets/avatars/Netflix/sex-education_rahim-QOGHJLlT.png", "/assets_avatars/Netflix/sex-education_ruby-Dmb-BZbU.png", "/assets/avatars/Netflix/sex-education_viv-Cq0Mlnzr.png",
    "/assets/avatars/Netflix/sirenejcrois-CYkuW-P2.png", "/assets/avatars/Netflix/squid-game_alvole-C4FlkKLj.png", "/assets/avatars/Netflix/squid-game_avatar_de_profil-DwcN9Ip_.png",
    "/assets/avatars/Netflix/squid-game_gi-hun-LUj9vumu.png", "/assets/avatars/Netflix/squid-game_gi-hun_saison_2-t9K3hHbc.png", "/assets/avatars/Netflix/squid-game_hyun-ju-BWXQi48P.png",
    "/assets/avatars/Netflix/squid-game_in-ho-BF_JtXyF.png", "/assets/avatars/Netflix/squid-game_jun-hee-Bq_D-P6z.png", "/assets_avatars/Netflix/squid-game_jun-ho-D95wdo2A.png",
    "/assets/avatars/Netflix/squid-game_leader-DV-KDfCW.png", "/assets/avatars/Netflix/squid-game_manager_masqu-DRAHBYmp.png", "/assets/avatars/Netflix/squid-game_masked_worker-CpZk2pPA.png",
    "/assets/avatars/Netflix/squid-game_myung-gi-BxBTL3Kh.png", "/assets/avatars/Netflix/squid-game_no-eul-cTX0eQtB.png", "/assets/avatars/Netflix/squid-game_officier_masqu-xzED9ZZr.png",
    "/assets/avatars/Netflix/squid-game_recruteur-B3mVjqKy.png", "/assets/avatars/Netflix/squid-game_soldat_masqu-B3Ko69Hg.png", "/assets/avatars/Netflix/squid-game_thanos-DmmMtF-t.png",
    "/assets/avatars/Netflix/squid-game_tirelire-C-pOOH4A.png", "/assets/avatars/Netflix/squid-game_young-hee-oNvylBt9.png", "/assets/avatars/Netflix/stranger-things_avatar_de_profil-CUSbybub.png",
    "/assets/avatars/Netflix/stranger-things_dmogorgon-6N9xdYNC.png", "/assets/avatars/Netflix/stranger-things_dustin-24cjRKE0.png", "/assets/avatars/Netflix/stranger-things_jonathan-D23yCp3Q.png",
    "/assets/avatars/Netflix/stranger-things_joyce-DAWoO4Er.png", "/assets/avatars/Netflix/stranger-things_lucas-Dkz2LwBa.png", "/assets/avatars/Netflix/stranger-things_mike-BMFAOzap.png",
    "/assets/avatars/Netflix/stranger-things_nancy-DoF9kIUP.png", "/assets/avatars/Netflix/stranger-things_onze-rlZ3jnlV.png", "/assets/avatars/Netflix/stranger-things_will-BRTmbT4m.png",
    "/assets/avatars/Netflix/the-witcher_ablette-BQOgPuhI.png", "/assets/avatars/Netflix/the-witcher_ciri-B55Q2n5R.png", "/assets/avatars/Netflix/the-witcher_deux_pes-Fbn765Nk.png",
    "/assets/avatars/Netflix/the-witcher_geralt-Bd-LkC5G.png", "/assets/avatars/Netflix/the-witcher_jaskier-uT0u4zQ8.png", "/assets/avatars/Netflix/the-witcher_kikimorrhe-D_0ywMke.png",
    "/assets/avatars/Netflix/the-witcher_lchi-BblvP8CG.png", "/assets/avatars/Netflix/the-witcher_logo_the_witcher-BAfbp8BI.png", "/assets_avatars/Netflix/the-witcher_nivellen-BjyvAFcn.png",
    "/assets/avatars/Netflix/the-witcher_pe_joyeuse-BSkBdUvI.png", "/assets/avatars/Netflix/the-witcher_yennefer-DqVqze_8.png", "/assets/avatars/Netflix/umbrella-academy_allison-71Eo86NH.png",
    "/assets/avatars/Netflix/umbrella-academy_ben-C9TTb2AQ.png", "/assets/avatars/Netflix/umbrella-academy_cinq-BLl7wvPx.png", "/assets/avatars/Netflix/umbrella-academy_diego-R7kEepk3.png",
    "/assets/avatars/Netflix/umbrella-academy_klaus-BwqcPTcY.png", "/assets/avatars/Netflix/umbrella-academy_luther-DpBi0VzS.png", "/assets/avatars/Netflix/umbrella-academy_pogo-CuZ5SV8w.png",
    "/assets/avatars/Netflix/umbrella-academy_viktor-DFa-gou4.png", "/assets/avatars/Netflix/zombie-EFkfL8gF.png"
];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const groupAvatarsBySeries = (avatarPaths: string[]): Record<string, string[]> => {
  return avatarPaths.reduce((acc, path) => {
    const filename = path.split('/').pop() || '';
    const seriesKey = filename.split('_')[0].replace(/-/g, ' ');
    const seriesTitle = seriesKey.split(' ').map(capitalize).join(' ');

    if (!acc[seriesTitle]) {
      acc[seriesTitle] = [];
    }
    acc[seriesTitle].push(path);
    return acc;
  }, {} as Record<string, string[]>);
};

const AvatarGroup = ({ title, avatarPaths, selectedAvatar, onSelect }: { title: string, avatarPaths: string[], selectedAvatar: string, onSelect: (path: string) => void }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground capitalize">{title}</h3>
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-4 pb-4">
                {avatarPaths.map(src => (
                    <button 
                        key={src} 
                        onClick={() => onSelect(src)} 
                        className={cn(
                            "rounded-full overflow-hidden border-4 flex-shrink-0 transition-all duration-200", 
                            selectedAvatar === src ? 'border-primary ring-4 ring-primary/30' : 'border-transparent hover:border-primary/50'
                        )}
                    >
                        <Image src={src} alt={`Avatar de ${title}`} width={80} height={80} className="hover:scale-110 transition-transform"/>
                    </button>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    </div>
);


export default function WelcomePage() {
    const [username, setUsername] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(netflixAvatars[0]);
    const [importCode, setImportCode] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    const { setUsernameAndAvatar, markOnboardingAsComplete } = useUser();
    const { setLists } = useMediaLists();
    const { toast } = useToast();
    const router = useRouter();

    const groupedNetflixAvatars = groupAvatarsBySeries(netflixAvatars);
    const groupedDisneyAvatars = groupAvatarsBySeries(disneyAvatars);

    const handleCreateProfile = () => {
        if (!username.trim()) {
            toast({ title: 'Pseudo requis', description: 'Veuillez choisir un pseudo.', variant: 'destructive' });
            return;
        }
        if (!selectedAvatar) {
            toast({ title: 'Avatar requis', description: 'Veuillez choisir un avatar.', variant: 'destructive' });
            return;
        }
        setUsernameAndAvatar(username, selectedAvatar);
        markOnboardingAsComplete();
        router.push('/');
    };
    
    const handleImportFromCode = () => {
        if (!importCode.trim()) {
          toast({ title: "Aucun code à importer", description: "Veuillez coller votre code.", variant: "destructive" });
          return;
        }
        setIsImporting(true);
        try {
          const jsonString = decodeURIComponent(escape(atob(importCode.trim())));
          const importedData = JSON.parse(jsonString);

          if (importedData.username && importedData.avatar && Array.isArray(importedData.toWatchList) && Array.isArray(importedData.watchedList)) {
            const isValidMediaArray = (arr: any[]): arr is Media[] => arr.every(item => typeof item.id === 'string' && typeof item.title === 'string' && (item.mediaType === 'movie' || item.mediaType === 'tv'));
            if (isValidMediaArray(importedData.toWatchList) && isValidMediaArray(importedData.watchedList)) {
              setLists(importedData.toWatchList, importedData.watchedList);
              setUsernameAndAvatar(importedData.username, importedData.avatar);
              markOnboardingAsComplete();
              router.push('/');
            } else { throw new Error("Données de listes invalides."); }
          } else { throw new Error("La structure du code est incorrecte."); }
        } catch (error: any) {
          toast({ title: "Erreur d'importation", description: "Le code est invalide ou corrompu.", variant: "destructive" });
        } finally {
          setIsImporting(false);
        }
    };
    
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-4xl shadow-2xl">
                 <div className="p-4 sm:p-6 md:p-8">
                     <div className="text-center mb-8">
                        <Image src="/assets/mascotte/mascotte.svg" alt="Popito Mascotte" width={96} height={96} className="mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-primary">Bienvenue sur CinéPrime !</h1>
                        <p className="text-muted-foreground mt-2">Configurez votre profil pour commencer.</p>
                    </div>
                    <Tabs defaultValue="create" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="create"><User className="mr-2 h-4 w-4" /> Créer un profil</TabsTrigger>
                            <TabsTrigger value="login"><LogIn className="mr-2 h-4 w-4" /> Se connecter</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="create" className="mt-6">
                            <div className="flex flex-col h-[60vh] space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-base font-semibold">1. Choisissez un pseudo</Label>
                                    <Input id="username" placeholder="Ex: PopcornLover" value={username} onChange={(e) => setUsername(e.target.value)} />
                                </div>
                                <div className="space-y-2 flex-grow flex flex-col min-h-0">
                                    <Label className="text-base font-semibold">2. Choisissez un avatar</Label>
                                    <ScrollArea className="flex-grow rounded-md border p-4">
                                        <div className="space-y-8">
                                            <h2 className="text-xl font-bold text-primary">Netflix</h2>
                                            {Object.entries(groupedNetflixAvatars).map(([series, avatars]) => (
                                                <AvatarGroup 
                                                    key={series}
                                                    title={series}
                                                    avatarPaths={avatars}
                                                    selectedAvatar={selectedAvatar}
                                                    onSelect={setSelectedAvatar}
                                                />
                                            ))}
                                            <h2 className="text-xl font-bold text-primary mt-8">Disney+</h2>
                                             {Object.entries(groupedDisneyAvatars).map(([series, avatars]) => (
                                                <AvatarGroup 
                                                    key={series}
                                                    title={series}
                                                    avatarPaths={avatars}
                                                    selectedAvatar={selectedAvatar}
                                                    onSelect={setSelectedAvatar}
                                                />
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                                <div className="flex-shrink-0 pt-4">
                                  <Button onClick={handleCreateProfile} className="w-full text-lg py-6">Commencer</Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="login" className="mt-6">
                           <div className="flex flex-col justify-center space-y-4 max-w-md mx-auto py-8">
                                <CardHeader className="p-0 text-center mb-4">
                                    <CardTitle>Restaurer vos données</CardTitle>
                                    <CardDescription>Collez votre code de sauvegarde pour retrouver votre profil et vos listes.</CardDescription>
                                </CardHeader>
                                <div className="space-y-2">
                                    <Label htmlFor="import-code" className="font-semibold">Code de sauvegarde</Label>
                                    <Textarea id="import-code" placeholder="Collez votre code ici..." value={importCode} onChange={(e) => setImportCode(e.target.value)} className="min-h-[150px] font-mono text-xs" />
                                </div>
                                <Button onClick={handleImportFromCode} className="w-full text-lg py-6" disabled={isImporting}>
                                    {isImporting ? <Loader2 className="animate-spin mr-2"/> : <LogIn className="mr-2"/>} Se Connecter
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </Card>
        </div>
    );
}
