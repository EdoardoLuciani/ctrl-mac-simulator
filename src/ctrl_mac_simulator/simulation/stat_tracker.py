import plotly.graph_objects as go
from plotly.subplots import make_subplots
import numpy as np

class StatTracker():
    ftr_tracker = []
    measurement_latency_tracker = []

    @classmethod
    def append_ftr(cls, ftr):
        cls.ftr_tracker.append(ftr)

    @classmethod
    def append_measurement_latency(cls, ftr):
        cls.measurement_latency_tracker.append(ftr)

    @classmethod
    def plot_measurements(cls):
        # Create subplots: 2 rows, 1 column
        fig = make_subplots(rows=2, cols=1,
                            subplot_titles=('Discrete Values Time Series',
                                            'Distribution of Measurement Latency'))

        # Add the line trace for ftr_tracker
        fig.add_trace(
            go.Scatter(x=np.arange(len(cls.ftr_tracker)),
                       y=cls.ftr_tracker,
                       mode='lines+markers',
                       name='FTR Time Series'),
            row=1, col=1
        )

        # Add histogram trace for measurement_latency_tracker
        fig.add_trace(
            go.Histogram(x=cls.measurement_latency_tracker,
                         nbinsx=20,
                         name='Measurement Latency'),
            row=2, col=1
        )

        # Update layout
        fig.update_layout(
            height=800,  # Adjust the height to accommodate both plots
            title_text='FTR and Measurement Latency Analysis',
            template='plotly_white'
        )

        # Update x-axis and y-axis labels
        fig.update_xaxes(title_text='Array Position', row=1, col=1)
        fig.update_yaxes(title_text='Value', row=1, col=1)
        fig.update_xaxes(title_text='Latency', row=2, col=1)
        fig.update_yaxes(title_text='Frequency', row=2, col=1)

        # Show the plot
        fig.show()
