import urllib.request
import json
import os
import cv2
import pandas as pd
import numpy as np

print('=== STEP 1: Verify /api/episodes ===')
req = urllib.request.urlopen('http://localhost:8000/api/episodes')
episodes = json.loads(req.read().decode('utf-8'))
print(f'Total episodes returned: {len(episodes)}')
for ep in episodes:
    idx = ep.get('episode_index')
    num_f = ep.get('num_frames')
    fw = ep.get('feasible_window')
    print(f'Episode #{idx}: total={num_f} frames, feasible_window={fw}')
    assert fw is not None, f'Episode #{idx} missing feasible_window'
    assert 'start' in fw and 'end' in fw, 'feasible_window malformed'

print('\n=== STEP 2: Verify /api/trajectory/approach_path with auto_trim ===')
req_data = json.dumps({'episode_id': episodes[-1]['episode_id'], 'auto_trim': True}).encode('utf-8')
req = urllib.request.Request('http://localhost:8000/api/trajectory/approach_path', data=req_data, headers={'Content-Type': 'application/json'})
resp = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
assert resp['status'] == 'success', f'Approach path failed: {resp}'
app_data = resp['approach']
n_app = app_data['num_frames']
trimmed_f0 = resp.get('trimmed_start_frame')
print(f'Approach path generated: {n_app} frames, trimmed_start_frame={trimmed_f0}')
assert n_app > 0, 'Approach path is empty'

print('\n=== STEP 3: Verify /api/export_lerobot (Free-Form + Auto-Trim) ===')
req_data = json.dumps({'trajectory_mode': 'free_form', 'auto_trim': True}).encode('utf-8')
req = urllib.request.Request('http://localhost:8000/api/export_lerobot', data=req_data, headers={'Content-Type': 'application/json'})
resp = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
assert resp['status'] == 'success', f'Export failed: {resp}'
export_path = resp['export_path']
print(f'Export path: {export_path}')

# Check parquet file
parquet_path = os.path.join(export_path, 'data', 'chunk-000', 'file-000.parquet')
df = pd.read_parquet(parquet_path)
print(f'Parquet total rows: {len(df)}')

# Group by episode_index
for ep_idx in sorted(df['episode_index'].unique()):
    ep_df = df[df['episode_index'] == ep_idx]
    video_path = os.path.join(export_path, 'videos', 'observation.images.phone', 'chunk-000', f'episode_{ep_idx:06d}.mp4')
    assert os.path.exists(video_path), f'Video missing: {video_path}'
    cap = cv2.VideoCapture(video_path)
    vid_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    cap.release()
    print(f'Episode {ep_idx}: Parquet rows = {len(ep_df)}, Video frames = {vid_frames}')
    assert len(ep_df) == vid_frames, f'Mismatch in ep {ep_idx}: parquet={len(ep_df)} vs vid={vid_frames}'

print('\n=== STEP 4: Verify /api/export_lerobot (Initial-Aware + Auto-Trim) ===')
req_data = json.dumps({'trajectory_mode': 'initial_aware', 'auto_trim': True}).encode('utf-8')
req = urllib.request.Request('http://localhost:8000/api/export_lerobot', data=req_data, headers={'Content-Type': 'application/json'})
resp = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
assert resp['status'] == 'success', f'Export failed: {resp}'
export_path = resp['export_path']

parquet_path = os.path.join(export_path, 'data', 'chunk-000', 'file-000.parquet')
df_init = pd.read_parquet(parquet_path)
print(f'Initial-Aware Parquet total rows: {len(df_init)}')

for ep_idx in sorted(df_init['episode_index'].unique()):
    ep_df = df_init[df_init['episode_index'] == ep_idx]
    video_path = os.path.join(export_path, 'videos', 'observation.images.phone', 'chunk-000', f'episode_{ep_idx:06d}.mp4')
    cap = cv2.VideoCapture(video_path)
    vid_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    cap.release()
    print(f'Episode {ep_idx} (Initial-Aware): Parquet rows = {len(ep_df)}, Video frames = {vid_frames}')
    assert len(ep_df) == vid_frames, f'Mismatch in initial-aware ep {ep_idx}: parquet={len(ep_df)} vs vid={vid_frames}'

print('\nSUCCESS: ALL 4 VERIFICATION SUITES PASSED!')
