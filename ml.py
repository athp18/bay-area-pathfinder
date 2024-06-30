# perform inference for a graph to add/change weights & use dijkstra's to find the locally optimum weighted path
# basic (needs fixing) implementation

import pandas as pd
import numpy as np
import networkx as nx
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import StandardScaler

class Predict:
    def __init__(self, graph_data, features_data):
        self.graph = nx.Graph(graph_data)
        self.features = pd.DataFrame(features_data)
        self.model = None
        self.scaler = StandardScaler()
    
    def prepare_data(self):
        # Prepare features and target
        X = self.features.drop('weight', axis=1)
        y = self.features['weight']
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Split data
        return train_test_split(X_scaled, y, test_size=0.2, random_state=42)
    
    def train_model(self):
        X_train, X_test, y_train, y_test = self.prepare_data()
        
        # Train MLP Regressor
        self.model = MLPRegressor(hidden_layer_sizes=(100, 50), max_iter=500, random_state=42)
        self.model.fit(X_train, y_train)
        
        # Print model performance
        train_score = self.model.score(X_train, y_train)
        test_score = self.model.score(X_test, y_test)
        print(f"Train R2 Score: {train_score:.4f}")
        print(f"Test R2 Score: {test_score:.4f}")
    
    def update_graph_weights(self):
        for edge in self.graph.edges(data=True):
            node1, node2, data = edge
            features = self.features.loc[(self.features['node1'] == node1) & (self.features['node2'] == node2)]
            if not features.empty:
                X = features.drop('weight', axis=1)
                X_scaled = self.scaler.transform(X)
                predicted_weight = self.model.predict(X_scaled)[0]
                self.graph[node1][node2]['weight'] = predicted_weight
    
    def find_optimal_path(self, start, end):
        if not nx.has_path(self.graph, start, end):
            return None, float('inf')
        
        path = nx.dijkstra_path(self.graph, start, end, weight='weight')
        path_length = nx.dijkstra_path_length(self.graph, start, end, weight='weight')
        
        return path, path_length
