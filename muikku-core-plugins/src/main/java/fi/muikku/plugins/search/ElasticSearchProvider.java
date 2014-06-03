package fi.muikku.plugins.search;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.ejb.Stateful;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;

import org.codehaus.jackson.map.ObjectMapper;
import org.elasticsearch.action.delete.DeleteResponse;
import org.elasticsearch.action.index.IndexResponse;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.Client;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.node.Node;
import org.elasticsearch.search.SearchHit;

import static org.elasticsearch.node.NodeBuilder.*;

@ApplicationScoped
@Stateful
public class ElasticSearchProvider implements SearchProvider {

  @Inject
  private Logger logger;

  @PostConstruct
  public void init() {
    Node node = nodeBuilder().node();
    elasticClient = node.client();
  }

  @PreDestroy
  public void shutdown() {
    elasticClient.close();
  }

  @Override
  public SearchResult search(Map<String, String> Query, int start, int maxResults, Class<?>... types) {
    String[] typenames = new String[types.length];
    for (int i = 0; i < types.length; i++) {
      typenames[i] = types[i].getSimpleName();
    }
    SearchResponse response = elasticClient.prepareSearch("muikku").setTypes(typenames).setQuery(Query).execute().actionGet();
    List<Map<String, Object>> searchResults = new ArrayList<Map<String, Object>>();
    SearchHit[] results = response.getHits().getHits();
    for (SearchHit hit : results) {
      Map<String, Object> hitSource = hit.getSource();
      searchResults.add(hitSource);
    }
    SearchResult result = new SearchResult(searchResults.size(), start, maxResults, searchResults);
    return result;
  }

  @Override
  public SearchResult freeTextSearch(String text, int start, int maxResults) {
    SearchResponse response = elasticClient.prepareSearch().setQuery(QueryBuilders.matchQuery("_all", text)).setFrom(start).setSize(maxResults).execute()
        .actionGet();
    List<Map<String, Object>> searchResults = new ArrayList<Map<String, Object>>();
    SearchHit[] results = response.getHits().getHits();
    for (SearchHit hit : results) {
      Map<String, Object> hitSource = hit.getSource();
      searchResults.add(hitSource);
    }
    SearchResult result = new SearchResult(searchResults.size(), start, maxResults, searchResults);
    return result;
  }

  @Override
  public SearchResult matchAllSearch(int start, int maxResults) {
    SearchResponse response = elasticClient.prepareSearch().setQuery(QueryBuilders.matchAllQuery()).setFrom(start).setSize(maxResults).execute().actionGet();
    List<Map<String, Object>> searchResults = new ArrayList<Map<String, Object>>();
    SearchHit[] results = response.getHits().getHits();
    for (SearchHit hit : results) {
      Map<String, Object> hitSource = hit.getSource();
      searchResults.add(hitSource);
    }
    SearchResult result = new SearchResult(searchResults.size(), start, maxResults, searchResults);
    return result;

  }

  @Override
  public void addOrUpdateIndex(String typeName, Map<String, Object> entity) {
    ObjectMapper mapper = new ObjectMapper();
    String json;
    try {
      json = mapper.writeValueAsString(entity);
      Long id = (Long) entity.get("id");
      @SuppressWarnings("unused")
      IndexResponse response = elasticClient.prepareIndex("muikku", typeName, id.toString()).setSource(json).execute().actionGet();
    } catch (IOException e) {
      logger.log(Level.SEVERE, "Adding to index failed because of exception", e);
    }

  }

  @Override
  public void deleteFromIndex(String typeName, Long id) {
    @SuppressWarnings("unused")
    DeleteResponse response = elasticClient.prepareDelete("muikku", typeName, id.toString()).execute().actionGet();
  }

  private Client elasticClient;

}