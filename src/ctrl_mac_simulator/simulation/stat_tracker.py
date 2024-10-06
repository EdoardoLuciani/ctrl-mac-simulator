import plotly.graph_objects as go
import numpy as np

class StatTracker():
    ftr_tracker = []

    @classmethod
    def append_ftr(cls, ftr):
        cls.ftr_tracker.append(ftr)

    @classmethod
    def plot_ftr(cls):
        fig = go.Figure()

        # Add the line trace
        fig.add_trace(go.Scatter(x=np.arange(len(cls.ftr_tracker)), y=cls.ftr_tracker, mode='lines+markers', name='Time Series'))

        # Update layout
        fig.update_layout(
            title='Discrete Values Time Series',
            xaxis_title='Array Position',
            yaxis_title='Value',
            template='plotly_white'
        )

        # Show the plot
        fig.show()
