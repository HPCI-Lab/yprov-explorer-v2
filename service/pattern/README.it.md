🇮🇹 Italiano | [🇬🇧 English](/api/graphs?lang=en)

# Provenance Graph Motif API

Motif API fornisce un’interfaccia per l’estrazione di pattern di sottografi a partire da un grafo di origine fornito in input. Il servizio è basato su un’architettura *Python* e si appoggia principalmente alla libreria **Graph-Tool**. A partire dal source graph, la libreria consente di individuare ed estrarre i pattern strutturali ricorrenti del grafo, definiti come *Motif*.

## Introduzione
Il servizio di estrazione dei pattern è integrato all’interno dell’applicazione **yProv Explorer** e viene utilizzato per individuare sottografi frequenti presenti nei grafi di provenance.

La Motif API si basa su un’architettura *Python* e sfrutta la libreria dedicata *Graph-Tool*, che consente l’analisi strutturale dei grafi. In particolare, il numero di nodi dei pattern da estrarre è controllato dal parametro **k**, che definisce la dimensione dei motif ricercati. I risultati possono inoltre essere filtrati tramite il parametro **min_occurrences**, che permette di selezionare esclusivamente i pattern che compaiono almeno un determinato numero di volte, consentendo così di individuare motif più o meno rari all’interno del grafo analizzato.

<p align="center">
  <img src="/outputs/pattern_graph.png" alt="Graphs">
</p>


## Istruzioni
L’API si basa su diverse chiamate web di tipo **GET** e **POST**, che permettono di interagire con i grafi e con i pattern estratti all’interno dell’applicazione **yProv Explorer**.

+ **API Home** 
rappresenta la homepage dedicata all'introduzione dei servizi offerti dall'API 
```html
GET /api/graphs
```

+ **Upload Graph**
funzione utilizzata per il caricamento del file di *provenance* all’interno dell’applicazione, che viene successivamente passata al servizio di estrazione dei motif.

```html
GET /api/graphs/upload
```

*Preview & Response:* la risposta restituisce un *ID univoco* e il *nome completo* del file, composto dall’ID e dal nome originale del file caricato.

<p align=center>
    <i>filename]: [id] + [namefile]
</p>

```json
#Esempio
{
    "status": "ok",
    "id": "7c5221eb-fe22-46f4-9c16-d21e6bb4c3b7",
    "filename":"7c5221eb-fe22-46f4-9c16-d21e6bb4c3b7_yprov4wfs_openeo_complex.json"
}
```

+ **Pattern Extract** 
funzione responsabile del caricamento del source file fornito in input e del suo inoltro alla funzione di backend che consente l’estrazione dei *motif*.
L’operazione prevede inoltre la validazione del parametro **k**, anch’esso fornito in input, utilizzato per determinare la dimensione (numero di nodi) dei pattern ricercati. Integrando se necessario il parametro **min_occurences** per filtrare i motif per una *minima occorrenza*.

```html
POST /api/graphs/{stored_filename}/pattern
```

*Preview:* esponse tutte le istanze motif ricavate, insieme ai loro parametri k, insieme alle immagini create per ciascun motif.


*Response:* mostra tutte le istanze di pattern estratte dal source file per un determinato valore di k.

```json
#Esempio
{
    [
        {
            "motif_id": "#1",
            "image": "/patterns/images.png",
            "k": 3,
            "occurrences": 31,
            "instances": [{}, {}, ...]
        },
        {
            "motif_id": "#2",
            "image": "/patterns/images.png",
            "k": 3,
            "occurrences": 52,
            "instances": [{}, {}, ...]
        }
        ...
    ]
}
```

*Se non viene specificati i parametri k e min occurences, mostra **tutti pattern** calcolati*

+ **Pattern List**
funzione complementare a *Pattern Extract*, accessibile tramite una chiamata web di tipo *GET*.
Fornisce un *catalogo dei pattern* estratti dal source graph. Utilizzando i parametri **k** e **min_occurrences**, è possibile visualizzare i pattern relativi a una specifica dimensione e con una frequenza minima nel grafo.

```html
GET /api/graphs/{stored_filename}/pattern?k=<value>&min_occurences=<value>
```

+ **Get Pattern**
chiamata utilizzata per analizzare un singolo *motif*, riferente a un pattern specifico definito dai parametri *k* e *min_occurences*.  

```html
GET /api/graphs/{stored_filename}/pattern?k=<value>&min_occurences=<value>/{motif_ID}
```

*Preview & Response:* mette in evidenza un singolo *motif* con le sue specifiche: *id, images, min occurences e tutte le sue istanze*

```json
#Esempio
    {
        "motif_id": "#3",
        "image": "/patterns/images.png",
        "k": 3,
        "occurrences": 52,
        "instances": [{}, {}, ...]
    }
```

## Sviluppatori
*Ismaele Landini*

## File Caricati